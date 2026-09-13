import { brandSticker } from '../../lib/stickerBrand.js';

export default {
  name: 'steal',
  alias: ['take', 'sticker'],
  description: 'Steal a sticker (re-brand it as Paxton MD), or turn a replied image into a Paxton MD sticker. Reply with .steal [pack name]',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const stickerMsg = quoted?.stickerMessage;
    const imageMsg = quoted?.imageMessage;
    if (!stickerMsg && !imageMsg) return sock.sendMessage(chatId, { text: '❌ Reply to a sticker or an image with .steal' }, { quoted: msg });

    const packname = args.join(' ') || 'Paxton MD';

    try {
      const { downloadContentFromMessage } = await import('@whiskeysockets/baileys');
      if (stickerMsg) {
        const stream = await downloadContentFromMessage(stickerMsg, 'sticker');
        const chunks = [];
        for await (const chunk of stream) chunks.push(chunk);
        const rebranded = await brandSticker(Buffer.concat(chunks), packname, 'Paxton MD');
        await sock.sendMessage(chatId, { sticker: rebranded }, { quoted: msg });
      } else {
        const stream = await downloadContentFromMessage(imageMsg, 'image');
        const chunks = [];
        for await (const chunk of stream) chunks.push(chunk);
        const buffer = Buffer.concat(chunks);
        const sharp = (await import('sharp')).default;
        const webp = await sharp(buffer)
          .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
          .webp()
          .toBuffer();
        const branded = await brandSticker(webp, packname, 'Paxton MD');
        await sock.sendMessage(chatId, { sticker: branded }, { quoted: msg });
      }
    } catch (error) {
      await sock.sendMessage(chatId, { text: `❌ Failed: ${error.message}` }, { quoted: msg });
    }
  }
};
