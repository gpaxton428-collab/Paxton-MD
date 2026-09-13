export default {
  name: 'capitalize',
  alias: ['titlecase'],
  description: 'Capitalize the first letter of every word. Usage: .capitalize hello world',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const text = args.join(' ');
    if (!text) return sock.sendMessage(chatId, { text: '❌ Usage: .capitalize <text>' }, { quoted: msg });
    const result = text.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
    await sock.sendMessage(chatId, { text: `🔠 ${result}` }, { quoted: msg });
  }
};
