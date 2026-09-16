import { giftedJson } from '../../lib/giftedApi.js';

export default {
  name: 'googleimage',
  alias: ['imgsearch'],
  description: 'Search Google Images for a keyword. Usage: .googleimage <query>',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const query = args.join(' ');
    if (!query) return sock.sendMessage(chatId, { text: '❌ Usage: .googleimage <query>' }, { quoted: msg });
    try {
      const data = await giftedJson('/search/googleimage', { query });
      const results = data?.result || [];
      const first = Array.isArray(results) ? results[0] : results;
      const imageUrl = first?.url || first?.image || first;
      if (!imageUrl || typeof imageUrl !== 'string') return sock.sendMessage(chatId, { text: `❌ No image results for "${query}".` }, { quoted: msg });
      await sock.sendMessage(chatId, { image: { url: imageUrl }, caption: `🖼️ ${query}` }, { quoted: msg });
    } catch (error) {
      await sock.sendMessage(chatId, { text: `❌ Search failed: ${error.message}` }, { quoted: msg });
    }
  }
};
