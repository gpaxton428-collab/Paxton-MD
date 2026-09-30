export default {
  name: 'steal',
  alias: ['take'],
  description: 'Steal a sticker (resend it), or turn a replied image into a sticker. Reply to a sticker or image with .steal',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const stickerMsg = quoted?.stickerMessage;
    const imageMsg = quoted?.imageMessage;
    if (!stickerMsg && !imageMsg) return sock.sendMessage(chatId, { text: '❌ Reply to a sticker or an image with .steal' }, { quoted: msg });

    try {
      const { downloadContentFromMessage } = await import('@whiskeysockets/baileys');
      if (stickerMsg) {
        const stream = await downloadContentFromMessage(stickerMsg, 'sticker');
        const chunks = [];
        for await (const chunk of stream) chunks.push(chunk);
        await sock.sendMessage(chatId, { sticker: Buffer.concat(chunks) }, { quoted: msg });
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
        await sock.sendMessage(chatId, { sticker: webp }, { quoted: msg });
      }
    } catch (error) {
      await sock.sendMessage(chatId, { text: `❌ Failed: ${error.message}` }, { quoted: msg });
    }
  }
};
