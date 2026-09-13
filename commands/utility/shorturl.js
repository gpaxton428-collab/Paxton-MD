export default {
  name: 'shorturl',
  alias: ['short'],
  description: 'Shorten a long URL. Usage: .shorturl https://example.com/very/long/link',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const url = args[0];
    if (!url || !/^https?:\/\//i.test(url)) return sock.sendMessage(chatId, { text: '❌ Usage: .shorturl <full URL starting with http/https>' }, { quoted: msg });
    try {
      const res = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
      const short = await res.text();
      await sock.sendMessage(chatId, { text: `🔗 ${short}` }, { quoted: msg });
    } catch (error) {
      await sock.sendMessage(chatId, { text: `❌ Failed to shorten: ${error.message}` }, { quoted: msg });
    }
  }
};
