export default {
  name: 'countdown',
  description: 'Count down the days until a given date (YYYY-MM-DD). Usage: .countdown 2026-12-25',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const target = new Date(args[0]);
    if (!args[0] || isNaN(target.getTime())) return sock.sendMessage(chatId, { text: '❌ Usage: .countdown <YYYY-MM-DD>' }, { quoted: msg });
    const now = new Date();
    const diffMs = target.getTime() - now.getTime();
    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (days < 0) return sock.sendMessage(chatId, { text: `📅 That date was ${Math.abs(days)} days ago.` }, { quoted: msg });
    await sock.sendMessage(chatId, { text: `📅 ${days} day${days === 1 ? '' : 's'} until ${args[0]}.` }, { quoted: msg });
  }
};
