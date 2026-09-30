export default {
  name: 'wiki',
  alias: ['wikipedia'],
  description: 'Get a quick Wikipedia summary. Usage: .wiki <topic>',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const query = args.join(' ');
    if (!query) return sock.sendMessage(chatId, { text: '❌ Usage: .wiki <topic>' }, { quoted: msg });
    try {
      const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`);
      if (!res.ok) return sock.sendMessage(chatId, { text: `❌ No Wikipedia article found for "${query}".` }, { quoted: msg });
      const data = await res.json();
      const text = `📖 *${data.title}*\n\n${data.extract}\n\n🔗 ${data.content_urls?.desktop?.page || ''}`;
      await sock.sendMessage(chatId, { text }, { quoted: msg });
    } catch (error) {
      await sock.sendMessage(chatId, { text: `❌ Lookup failed: ${error.message}` }, { quoted: msg });
    }
  }
};
