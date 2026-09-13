export default {
  name: 'expandurl',
  alias: ['unshorten'],
  description: 'Follow a shortened URL and show where it actually redirects to. Usage: .expandurl https://bit.ly/xyz',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const url = args[0];
    if (!url || !/^https?:\/\//.test(url)) return sock.sendMessage(chatId, { text: '❌ Usage: .expandurl <https://...>' }, { quoted: msg });
    try {
      const res = await fetch(url, { method: 'HEAD', redirect: 'follow' });
      await sock.sendMessage(chatId, { text: `🔗 Final destination:\n${res.url}\n\nStatus: ${res.status}` }, { quoted: msg });
    } catch (error) {
      await sock.sendMessage(chatId, { text: `❌ Failed: ${error.message}` }, { quoted: msg });
    }
  }
};
