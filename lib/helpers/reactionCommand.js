// Anime reaction GIFs (hug, pat, slap, ...) from the free waifu.pics API — no key.
// The GIF is converted to MP4 with ffmpeg so WhatsApp plays it as a looping clip;
// without ffmpeg the bot falls back to sending the link.
import { execFile } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import crypto from 'crypto';
import { fetchWithTimeout, downloadBuffer } from '../utils/http.js';
import { react, reply, replyError } from './reply.js';

const execFileAsync = promisify(execFile);

export const REACTIONS = {
  bite: 'bit', blush: 'is blushing at', bonk: 'bonked', bully: 'is bullying', cringe: 'cringed at', cry: 'cried in front of',
  cuddle: 'is cuddling', dance: 'is dancing with', glomp: 'glomped', handhold: 'is holding hands with', happy: 'is happy with',
  highfive: 'high-fived', hug: 'is hugging', kick: 'kicked', kill: 'killed', kiss: 'is kissing', lick: 'is licking', nom: 'is nomming',
  pat: 'is patting', poke: 'is poking', slap: 'slapped', smile: 'is smiling at', smug: 'is smug at', wave: 'waved at', wink: 'winked at', yeet: 'yeeted'
};

const num = (jid) => String(jid || '').split('@')[0].split(':')[0];

async function gifToMp4(buffer) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), `react-${crypto.randomBytes(4).toString('hex')}-`));
  try {
    const inFile = path.join(dir, 'in.gif'), outFile = path.join(dir, 'out.mp4');
    await fs.writeFile(inFile, buffer);
    await execFileAsync('ffmpeg', ['-y', '-loglevel', 'error', '-i', inFile, '-movflags', 'faststart', '-pix_fmt', 'yuv420p', '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2', outFile], { timeout: 30000 });
    return await fs.readFile(outFile);
  } finally { fs.rm(dir, { recursive: true, force: true }).catch(() => {}); }
}

export async function sendReaction(sock, msg, kind) {
  const chatId = msg.key.remoteJid;
  const sender = msg.key.participant || chatId;
  const info = msg.message?.extendedTextMessage?.contextInfo;
  const target = info?.mentionedJid?.[0] || info?.participant || sender;
  const self = num(target) === num(sender);
  try {
    await react(sock, msg, '🎭');
    const res = await fetchWithTimeout(`https://api.waifu.pics/sfw/${kind}`, {}, 15000);
    if (!res.ok) return reply(sock, msg, `❌ Reaction service returned ${res.status}.`);
    const { url } = await res.json();
    const caption = `*@${num(sender)} ${REACTIONS[kind]} ${self ? 'themselves' : `@${num(target)}`}*`;
    const mentions = [...new Set([sender, target])];
    const { buffer } = await downloadBuffer(url, { maxBytes: 10 * 1024 * 1024, timeoutMs: 20000 });
    try {
      const video = await gifToMp4(buffer);
      await sock.sendMessage(chatId, { video, gifPlayback: true, caption, mentions }, { quoted: msg });
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
      await reply(sock, msg, `${caption}\n${url}`, { mentions });
    }
  } catch (err) { await replyError(sock, msg, err, kind); }
}
