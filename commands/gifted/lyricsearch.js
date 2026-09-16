import { giftedJson } from '../../lib/giftedApi.js';

export default {
  name: 'lyricsearch',
  alias: ['lyrics2'],
  description: 'Search for song lyrics. Usage: .lyricsearch <query>',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const query = args.join(' ');
    if (!query) return sock.sendMessage(chatId, { text: '❌ Usage: .lyricsearch <query>' }, { quoted: msg });
    try {
      const data = await giftedJson('/search/lyrics', { query: query });
      const result = data?.result;
      const text = typeof result === 'string' ? result : JSON.stringify(result, null, 2).slice(0, 1500);
      await sock.sendMessage(chatId, { text: `🔎 *lyricsearch*\n\n${text}` }, { quoted: msg });
    } catch (error) {
      await sock.sendMessage(chatId, { text: `❌ Search failed: ${error.message}` }, { quoted: msg });
    }
  }
};
