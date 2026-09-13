export default {
  name: 'sitecheck',
  alias: ['isup'],
  description: 'Check whether a website is up. Usage: .sitecheck example.com',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    let target = args[0];
    if (!target) return sock.sendMessage(chatId, { text: '❌ Usage: .sitecheck <domain or URL>' }, { quoted: msg });
    if (!/^https?:\/\//i.test(target)) target = `https://${target}`;
    try {
      const start = Date.now();
      const res = await fetch(target, { method: 'GET' });
      const ms = Date.now() - start;
      await sock.sendMessage(chatId, { text: `✅ ${target} is up — HTTP ${res.status} (${ms}ms)` }, { quoted: msg });
    } catch (error) {
      await sock.sendMessage(chatId, { text: `❌ ${target} appears to be down or unreachable.` }, { quoted: msg });
    }
  }
};
