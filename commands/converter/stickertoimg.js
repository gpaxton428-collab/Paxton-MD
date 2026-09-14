import { wolvarexBuffer } from '../../lib/wolvarexApi.js';

export default {
  name: 'stickertoimg',
  description: 'Convert a sticker URL to a still image. Usage: .stickertoimg <sticker url>',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const url = args[0];
    if (!url) return sock.sendMessage(chatId, { text: '❌ Usage: .stickertoimg <sticker url>' }, { quoted: msg });
    try {
      const { buffer } = await wolvarexBuffer('/converter/sticker-to-img', { url });
      await sock.sendMessage(chatId, { image: buffer }, { quoted: msg });
    } catch (error) {
      await sock.sendMessage(chatId, { text: `❌ Conversion failed: ${error.message}` }, { quoted: msg });
    }
  }
};
