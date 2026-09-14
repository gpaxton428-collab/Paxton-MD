import { brandSticker } from '../../lib/stickerBrand.js';

export default {
  name: 'stickercrop',
  alias: ['scrop'],
  description: 'Turn a replied image into a Paxton MD sticker, cropped to fill the frame (no letterboxing). Usage: reply to an image with .stickercrop',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const imageMsg = quoted?.imageMessage;
    if (!imageMsg) return sock.sendMessage(chatId, { text: '❌ Reply to an image with .stickercrop' }, { quoted: msg });
    try {
      const { downloadContentFromMessage } = await import('@whiskeysockets/baileys');
      const stream = await downloadContentFromMessage(imageMsg, 'image');
      const chunks = [];
      for await (const chunk of stream) chunks.push(chunk);
      const sharp = (await import('sharp')).default;
      const webp = await sharp(Buffer.concat(chunks)).resize(512, 512, { fit: 'cover' }).webp().toBuffer();
      const branded = await brandSticker(webp, 'Paxton MD', 'Paxton MD');
      await sock.sendMessage(chatId, { sticker: branded }, { quoted: msg });
    } catch (error) {
      await sock.sendMessage(chatId, { text: `❌ Failed: ${error.message}` }, { quoted: msg });
    }
  }
};
