import { wolvarexBuffer } from '../../lib/wolvarexApi.js';

export default {
  name: 'videotosticker',
  description: 'Convert a video URL to a sticker. Usage: .videotosticker <video url>',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const url = args[0];
    if (!url) return sock.sendMessage(chatId, { text: '❌ Usage: .videotosticker <video url>' }, { quoted: msg });
    try {
      const { buffer } = await wolvarexBuffer('/converter/video-to-sticker', { url });
      await sock.sendMessage(chatId, { sticker: buffer }, { quoted: msg });
    } catch (error) {
      await sock.sendMessage(chatId, { text: `❌ Conversion failed: ${error.message}` }, { quoted: msg });
    }
  }
};
