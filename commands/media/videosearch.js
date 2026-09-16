import { wolvarexJson } from '../../lib/wolvarexApi.js';

export default {
  name: 'videosearch',
  description: 'Search for videos by keyword. Usage: .videosearch <query>',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const query = args.join(' ');
    if (!query) return sock.sendMessage(chatId, { text: '❌ Usage: .videosearch <query>' }, { quoted: msg });
    try {
      const data = await wolvarexJson('/search/videos', { q: query, page: '0' });
      const results = data?.result || data?.results || data?.videos || [];
      if (!results.length) return sock.sendMessage(chatId, { text: `❌ No results for "${query}".` }, { quoted: msg });
      const list = results.slice(0, 8).map((r, i) => `${i + 1}. ${r.title || r.name || 'Untitled'}${r.url ? `\n   ${r.url}` : ''}`).join('\n\n');
      await sock.sendMessage(chatId, { text: `🔎 *Video results for "${query}"*\n\n${list}` }, { quoted: msg });
    } catch (error) {
      await sock.sendMessage(chatId, { text: `❌ Search failed: ${error.message}` }, { quoted: msg });
    }
  }
};
