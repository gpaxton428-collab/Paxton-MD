import { safeErrorMessage } from '../../lib/utils/errors.js';

function escapeXml(text) {
  return String(text).replace(/[&<>\"']/g, (c) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&apos;' }[c]));
}

export default {
  name: 'watermark',
  description: 'Add a text watermark to a replied image using Sharp. Usage: reply to an image with .watermark <text>',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const imageMsg = msg.message?.imageMessage || quoted?.imageMessage;
    const text = args.join(' ').trim();
    if (!imageMsg || !text) return sock.sendMessage(chatId, { text: '❌ Reply to an image with .watermark <text>' }, { quoted: msg });
    try {
      const { downloadContentFromMessage } = await import('@whiskeysockets/baileys');
      const sharp = (await import('sharp')).default;
      const stream = await downloadContentFromMessage(imageMsg, 'image');
      const chunks = [];
      for await (const c of stream) chunks.push(c);
      const input = Buffer.concat(chunks);
      const meta = await sharp(input, { failOn: 'none' }).metadata();
      const width = Math.max(320, Math.min(meta.width || 1080, 1600));
      const height = Math.max(240, Math.min(meta.height || 1080, 1600));
      const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"><style>.wm{font-family:Arial,sans-serif;font-size:${Math.max(22, Math.round(width/28))}px;font-weight:700;fill:white;stroke:black;stroke-width:3px;paint-order:stroke;}</style><text x="${Math.round(width*0.03)}" y="${Math.round(height*0.94)}" class="wm">${escapeXml(text)}</text></svg>`;
      const buffer = await sharp(input, { failOn: 'none' }).composite([{ input: Buffer.from(svg), gravity: 'southwest' }]).jpeg({ quality: 88 }).toBuffer();
      await sock.sendMessage(chatId, { image: buffer, caption: '💧 Watermarked • powered by Paxton' }, { quoted: msg });
    } catch (error) {
      await sock.sendMessage(chatId, { text: `❌ Failed: ${safeErrorMessage(error)}` }, { quoted: msg });
    }
  }
};
