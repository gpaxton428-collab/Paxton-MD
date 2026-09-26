// Image preparation for profile pictures.
//
// ROOT CAUSE of the ".setbotpp reports a library error" bug:
// Baileys' updateProfilePicture() calls generateProfilePicture(), which
// dynamically imports `sharp` and then `jimp` and throws
// "No image processing library available" when neither can be loaded.
// `sharp` is a native module: on Termux, Alpine/musl images, some panels
// and mismatched Node versions its binary fails to load, and jimp was
// never installed. So the WhatsApp call itself was fine — the image could
// never be prepared.
//
// This module prepares the JPEG itself with the first backend that works
// (sharp -> jimp -> ffmpeg -> ImageMagick), and setProfilePicture() then
// sends the WhatsApp IQ directly, bypassing Baileys' generator.
import { execFile } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import crypto from 'crypto';
import { AppError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

const execFileAsync = promisify(execFile);

async function withSharp(buffer, size) {
  const mod = await import('sharp');
  const sharp = mod.default || mod;
  return sharp(buffer, { failOn: 'none' }).rotate().resize(size, size, { fit: 'cover' }).jpeg({ quality: 80 }).toBuffer();
}

async function withJimp(buffer, size) {
  const mod = await import('jimp');
  const J = mod.Jimp || mod.default?.Jimp || mod.default || mod;
  const img = await J.read(buffer);
  const w = img.bitmap?.width ?? img.getWidth?.();
  const h = img.bitmap?.height ?? img.getHeight?.();
  const min = Math.min(w, h);
  const x = Math.floor((w - min) / 2), y = Math.floor((h - min) / 2);
  if (typeof img.crop === 'function') { try { img.crop({ x, y, w: min, h: min }); } catch { img.crop(x, y, min, min); } }
  try { img.resize({ w: size, h: size }); } catch { img.resize(size, size); }
  if (typeof img.getBufferAsync === 'function') return img.getBufferAsync('image/jpeg');
  return img.getBuffer('image/jpeg', { quality: 80 });
}

async function withBinary(buffer, size) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), `pp-${crypto.randomBytes(4).toString('hex')}-`));
  const input = path.join(dir, 'in'), output = path.join(dir, 'out.jpg');
  try {
    await fs.writeFile(input, buffer);
    const vf = `crop='min(iw,ih)':'min(iw,ih)',scale=${size}:${size}`;
    try { await execFileAsync('ffmpeg', ['-y', '-loglevel', 'error', '-i', input, '-vf', vf, '-frames:v', '1', output], { timeout: 20000 }); }
    catch { await execFileAsync('convert', [input, '-gravity', 'center', '-crop', '1:1', '+repage', '-resize', `${size}x${size}`, output], { timeout: 20000 }); }
    return await fs.readFile(output);
  } finally { await fs.rm(dir, { recursive: true, force: true }).catch(() => {}); }
}

const BACKENDS = [['sharp', withSharp], ['jimp', withJimp], ['ffmpeg/imagemagick', withBinary]];

export async function prepareProfilePicture(buffer, size = 640) {
  const failures = [];
  for (const [name, fn] of BACKENDS) {
    try {
      const out = await fn(buffer, size);
      if (out?.length) return { buffer: out, backend: name };
    } catch (err) { failures.push(`${name}: ${String(err.message).split('\n')[0]}`); }
  }
  logger.error('imageProcessor', new Error(`No usable image backend — ${failures.join(' | ')}`));
  throw new AppError('No image backend available', {
    kind: 'internal',
    userMessage: '❌ *Image processing is unavailable on this server*\n\nThe bot could not load an image library (sharp/jimp).\n\n*Owner fix:* run `npm install sharp jimp` (or `npm rebuild sharp`) on the host, then restart. Use `.devcheck` to see which backends load.'
  });
}

export async function detectImageBackends() {
  const out = {};
  for (const name of ['sharp', 'jimp']) {
    try { await import(name); out[name] = true; } catch { out[name] = false; }
  }
  for (const bin of ['ffmpeg', 'convert']) {
    try { await execFileAsync(bin, ['-version'], { timeout: 4000 }); out[bin] = true; } catch { out[bin] = false; }
  }
  return out;
}

// Sets the profile picture of the bot (own JID) or of a group, without
// relying on Baileys' internal image library.
export async function setProfilePicture(sock, jid, imageBuffer) {
  const { buffer, backend } = await prepareProfilePicture(imageBuffer);
  const baileys = await import('@whiskeysockets/baileys');
  const { S_WHATSAPP_NET, jidNormalizedUser } = baileys;
  const me = sock.user?.id ? jidNormalizedUser(sock.user.id) : null;
  const target = jidNormalizedUser(jid);
  try {
    if (typeof sock.query === 'function') {
      await sock.query({
        tag: 'iq',
        attrs: { to: S_WHATSAPP_NET || 's.whatsapp.net', type: 'set', xmlns: 'w:profile:picture', ...(me && target === me ? {} : { target }) },
        content: [{ tag: 'picture', attrs: { type: 'image' }, content: buffer }]
      });
    } else {
      await sock.updateProfilePicture(jid, buffer);
    }
  } catch (err) {
    const code = err?.output?.statusCode || err?.data || '';
    logger.error('profilePicture', err, { backend, code });
    const message = /not-authorized|403|401/.test(String(err?.message) + code)
      ? '❌ *WhatsApp rejected the picture update*\n\nThe account is not allowed to change this picture (for groups, the bot must be an admin).'
      : `❌ *WhatsApp rejected the picture update*${code ? ` (code ${code})` : ''}\n\nTry a different, smaller image (JPG/PNG) or try again in a moment.`;
    throw new AppError('Profile picture update rejected', { kind: 'http', userMessage: message, cause: err });
  }
  return { backend };
}
