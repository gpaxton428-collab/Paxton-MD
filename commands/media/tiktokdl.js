import { wolvarexJson } from '../../lib/wolvarexApi.js';

export default {
  name: 'tiktokdl',
  alias: ['tiktok'],
  description: 'Download a TikTok video (no watermark, where available). Usage: .tiktokdl <tiktok url>',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const url = args[0];
    if (!url) return sock.sendMessage(chatId, { text: '❌ Usage: .tiktokdl <tiktok video url>' }, { quoted: msg });
    try {
      const data = await wolvarexJson('/download/tiktok/savetik', { url });
      const videoUrl = data?.result?.url || data?.result?.video || data?.url || data?.video;
      if (!videoUrl) return sock.sendMessage(chatId, { text: '❌ No downloadable video found for that link.' }, { quoted: msg });
      await sock.sendMessage(chatId, { video: { url: videoUrl }, caption: '🎵 TikTok download' }, { quoted: msg });
    } catch (error) {
      await sock.sendMessage(chatId, { text: `❌ Download failed: ${error.message}` }, { quoted: msg });
    }
  }
};
