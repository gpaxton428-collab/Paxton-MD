import { giftedJson } from '../../lib/giftedApi.js';

export default {
  name: 'playstoresearch',
  description: 'Search the Google Play Store. Usage: .playstoresearch <query>',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const query = args.join(' ');
    if (!query) return sock.sendMessage(chatId, { text: '❌ Usage: .playstoresearch <query>' }, { quoted: msg });
    try {
      const data = await giftedJson('/search/playstore', { query: query });
      const result = data?.result;
      const text = typeof result === 'string' ? result : JSON.stringify(result, null, 2).slice(0, 1500);
      await sock.sendMessage(chatId, { text: `🔎 *playstoresearch*\n\n${text}` }, { quoted: msg });
    } catch (error) {
      await sock.sendMessage(chatId, { text: `❌ Search failed: ${error.message}` }, { quoted: msg });
    }
  }
};
