import { wolvarexBuffer } from '../../lib/wolvarexApi.js';

export default {
  name: 'stickertovideo',
  description: 'Convert an animated sticker URL to a video. Usage: .stickertovideo <sticker url>',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const url = args[0];
    if (!url) return sock.sendMessage(chatId, { text: '❌ Usage: .stickertovideo <sticker url>' }, { quoted: msg });
    try {
      const { buffer } = await wolvarexBuffer('/converter/sticker-to-video', { url });
      await sock.sendMessage(chatId, { video: buffer }, { quoted: msg });
    } catch (error) {
      await sock.sendMessage(chatId, { text: `❌ Conversion failed: ${error.message}` }, { quoted: msg });
    }
  }
};
