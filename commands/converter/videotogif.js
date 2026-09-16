import { wolvarexBuffer } from '../../lib/wolvarexApi.js';

export default {
  name: 'videotogif',
  description: 'Convert a video URL to a GIF. Usage: .videotogif <video url>',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const url = args[0];
    if (!url) return sock.sendMessage(chatId, { text: '❌ Usage: .videotogif <video url>' }, { quoted: msg });
    try {
      const { buffer } = await wolvarexBuffer('/converter/video-to-gif', { url });
      await sock.sendMessage(chatId, { image: buffer, mimetype: 'image/gif' }, { quoted: msg });
    } catch (error) {
      await sock.sendMessage(chatId, { text: `❌ Conversion failed: ${error.message}` }, { quoted: msg });
    }
  }
};
