export default {
  name: 'ytsearch',
  alias: ['yts'],
  description: 'Search YouTube and list the top results. Usage: .ytsearch <query>',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const query = args.join(' ');
    if (!query) return sock.sendMessage(chatId, { text: '❌ Usage: .ytsearch <query>' }, { quoted: msg });
    try {
      const { default: ytSearch } = await import('yt-search');
      const { videos } = await ytSearch(query);
      if (!videos || videos.length === 0) return sock.sendMessage(chatId, { text: '❌ No results found.' }, { quoted: msg });
      const top = videos.slice(0, 5);
      const text = `🔎 *YouTube results for:* ${query}\n\n` + top.map((v, i) =>
        `${i + 1}. *${v.title}*\n   ⏱️ ${v.timestamp || 'live'} · 👁️ ${v.views?.toLocaleString?.() || '?'} views\n   ${v.url}`
      ).join('\n\n');
      await sock.sendMessage(chatId, { text }, { quoted: msg });
    } catch (error) {
      await sock.sendMessage(chatId, { text: `❌ Search failed: ${error.message}` }, { quoted: msg });
    }
  }
};
