import { giftedJson } from '../../lib/giftedApi.js';

export default {
  name: 'facebookdl',
  alias: ['fbdl'],
  description: 'Download a Facebook video/reel. Usage: .facebookdl <url>',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const url = args[0];
    if (!url) return sock.sendMessage(chatId, { text: '❌ Usage: .facebookdl <url>' }, { quoted: msg });
    try {
      const data = await giftedJson('/download/facebook', { url: url });
      const result = data?.result || data;
      const mediaUrl = result?.url || result?.download_url || result?.downloadUrl || result?.video || result?.hd || result?.sd;
      if (!mediaUrl) return sock.sendMessage(chatId, { text: '❌ No downloadable link found for that.' }, { quoted: msg });
      await sock.sendMessage(chatId, { video: { url: mediaUrl }, caption: result?.title || result?.description || '' }, { quoted: msg });
    } catch (error) {
      await sock.sendMessage(chatId, { text: `❌ Download failed: ${error.message}` }, { quoted: msg });
    }
  }
};
