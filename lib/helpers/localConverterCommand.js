// Local, ffmpeg-based media conversion for stickers/gifs/video — the
// free replacement for the old Wolvarex-backed converterCommand.js
// factory. Works on a replied/quoted message (not a URL): download the
// quoted media, run it through ffmpeg, send the result. Needs ffmpeg
// on the host (already an optional dependency for profile pictures —
// see lib/helpers/imageProcessor.js); if it's missing, the command
// fails with a clear message instead of a crash.
import { execFile } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import crypto from 'crypto';
import { react, reply, replyError } from './reply.js';
import { AppError } from '../utils/errors.js';

const execFileAsync = promisify(execFile);

const ACCEPT = {
  image: (m) => m.message?.imageMessage || m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage,
  video: (m) => m.message?.videoMessage || m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage,
  sticker: (m) => m.message?.stickerMessage || m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.stickerMessage,
};

async function downloadQuoted(msg, kind) {
  const target = ACCEPT[kind](msg);
  if (!target) return null;
  const { downloadContentFromMessage } = await import('@whiskeysockets/baileys');
  const whatsappType = kind === 'sticker' ? 'sticker' : kind;
  const stream = await downloadContentFromMessage(target, whatsappType);
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
}

export function createLocalConverterCommand({ name, alias, description, input, ffmpegArgs, outExt, send }) {
  return {
    name, alias, description,
    async execute(sock, msg, args, prefix) {
      const chatId = msg.key.remoteJid;
      const buffer = await downloadQuoted(msg, input);
      if (!buffer) return reply(sock, msg, `❌ Reply to ${input === 'image' ? 'an image' : input === 'video' ? 'a video or GIF' : 'a sticker'} with ${prefix}${name}`);
      let dir;
      try {
        await react(sock, msg, '🔄');
        dir = await fs.mkdtemp(path.join(os.tmpdir(), `conv-${crypto.randomBytes(4).toString('hex')}-`));
        const inFile = path.join(dir, `in-${Date.now()}`);
        const outFile = path.join(dir, `out-${Date.now()}.${outExt}`);
        await fs.writeFile(inFile, buffer);
        await execFileAsync('ffmpeg', ['-y', '-loglevel', 'error', '-i', inFile, ...ffmpegArgs, outFile], { timeout: 30000 });
        const result = await fs.readFile(outFile);
        await sock.sendMessage(chatId, send(result), { quoted: msg });
        await react(sock, msg, '✅');
      } catch (err) {
        if (err.code === 'ENOENT') {
          await replyError(sock, msg, new AppError('ffmpeg is not installed on this host — ask the bot owner to install it.', { kind: 'config' }), name);
        } else {
          await replyError(sock, msg, err, name);
        }
      } finally {
        if (dir) fs.rm(dir, { recursive: true, force: true }).catch(() => {});
      }
    }
  };
}
