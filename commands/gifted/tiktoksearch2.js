import { giftedJson } from '../../lib/giftedApi.js';

export default {
  name: 'tiktoksearch2',
  description: 'Search TikTok by keyword. Usage: .tiktoksearch2 <query>',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const query = args.join(' ');
    if (!query) return sock.sendMessage(chatId, { text: '❌ Usage: .tiktoksearch2 <query>' }, { quoted: msg });
    try {
      const data = await giftedJson('/search/tiktoksearch', { query: query });
      const result = data?.result;
      const text = typeof result === 'string' ? result : JSON.stringify(result, null, 2).slice(0, 1500);
      await sock.sendMessage(chatId, { text: `🔎 *tiktoksearch2*\n\n${text}` }, { quoted: msg });
    } catch (error) {
      await sock.sendMessage(chatId, { text: `❌ Search failed: ${error.message}` }, { quoted: msg });
    }
  }
};
