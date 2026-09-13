export default {
  name: 'toimage',
  alias: ['sticker2img', 'unsticker'],
  description: 'Convert a replied sticker back into a regular image. Usage: reply to a sticker with .toimage',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const stickerMsg = quoted?.stickerMessage;
    if (!stickerMsg) return sock.sendMessage(chatId, { text: '❌ Reply to a sticker with .toimage' }, { quoted: msg });
    try {
      const { downloadContentFromMessage } = await import('@whiskeysockets/baileys');
      const stream = await downloadContentFromMessage(stickerMsg, 'sticker');
      const chunks = [];
      for await (const chunk of stream) chunks.push(chunk);
      const sharp = (await import('sharp')).default;
      const png = await sharp(Buffer.concat(chunks)).png().toBuffer();
      await sock.sendMessage(chatId, { image: png, caption: '🖼️ Converted back to image' }, { quoted: msg });
    } catch (error) {
      await sock.sendMessage(chatId, { text: `❌ Failed: ${error.message}` }, { quoted: msg });
    }
  }
};
