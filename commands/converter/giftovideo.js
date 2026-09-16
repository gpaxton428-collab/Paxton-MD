import { wolvarexBuffer } from '../../lib/wolvarexApi.js';

export default {
  name: 'giftovideo',
  description: 'Convert a GIF URL to an MP4 video. Usage: .giftovideo <gif url>',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const url = args[0];
    if (!url) return sock.sendMessage(chatId, { text: '❌ Usage: .giftovideo <gif url>' }, { quoted: msg });
    try {
      const { buffer } = await wolvarexBuffer('/converter/gif-to-video', { url });
      await sock.sendMessage(chatId, { video: buffer }, { quoted: msg });
    } catch (error) {
      await sock.sendMessage(chatId, { text: `❌ Conversion failed: ${error.message}` }, { quoted: msg });
    }
  }
};
