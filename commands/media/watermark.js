import { safeErrorMessage } from '../../lib/utils/errors.js';
export default {
  name: 'watermark',
  description: "Add text watermarked onto a replied image (local, via jimp — no external API). Usage: reply to an image with .watermark <text>",
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const imageMsg = msg.message?.imageMessage || quoted?.imageMessage;
    const text = args.join(' ');
    if (!imageMsg || !text) return sock.sendMessage(chatId, { text: '❌ Reply to an image with .watermark <text>' }, { quoted: msg });
    try {
      const { downloadContentFromMessage } = await import('@whiskeysockets/baileys');
      const stream = await downloadContentFromMessage(imageMsg, 'image');
      const chunks = []; for await (const c of stream) chunks.push(c);
      const Jimp = (await import('jimp')).default;
      const image = await Jimp.read(Buffer.concat(chunks));
      const font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
      image.print(font, 10, image.bitmap.height - 42, text);
      const buffer = await image.getBufferAsync(Jimp.MIME_JPEG);
      await sock.sendMessage(chatId, { image: buffer, caption: `💧 Watermarked` }, { quoted: msg });
    } catch (error) {
      await sock.sendMessage(chatId, { text: `❌ Failed: ${safeErrorMessage(error)}` }, { quoted: msg });
    }
  }
};
