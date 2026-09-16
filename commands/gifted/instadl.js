import { giftedJson } from '../../lib/giftedApi.js';

export default {
  name: 'instadl',
  alias: ['igdl'],
  description: 'Download an Instagram reel/post. Usage: .instadl <url>',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const url = args[0];
    if (!url) return sock.sendMessage(chatId, { text: '❌ Usage: .instadl <url>' }, { quoted: msg });
    try {
      const data = await giftedJson('/download/instadl', { url: url });
      const result = data?.result || data;
      const mediaUrl = result?.url || result?.download_url || result?.downloadUrl || result?.video || result?.hd || result?.sd;
      if (!mediaUrl) return sock.sendMessage(chatId, { text: '❌ No downloadable link found for that.' }, { quoted: msg });
      await sock.sendMessage(chatId, { video: { url: mediaUrl }, caption: result?.title || result?.description || '' }, { quoted: msg });
    } catch (error) {
      await sock.sendMessage(chatId, { text: `❌ Download failed: ${error.message}` }, { quoted: msg });
    }
  }
};
