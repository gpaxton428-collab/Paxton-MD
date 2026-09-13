export default {
  name: 'textcase',
  alias: ['case'],
  description: 'Convert text case. Usage: .textcase upper|lower|reverse|title <text>',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const mode = args[0];
    const text = args.slice(1).join(' ');
    if (!text) return sock.sendMessage(chatId, { text: '❌ Usage: .textcase upper|lower|reverse|title <text>' }, { quoted: msg });
    let result;
    switch (mode) {
      case 'upper': result = text.toUpperCase(); break;
      case 'lower': result = text.toLowerCase(); break;
      case 'reverse': result = text.split('').reverse().join(''); break;
      case 'title': result = text.replace(/\w\S*/g, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase()); break;
      default: return sock.sendMessage(chatId, { text: '❌ Mode must be upper, lower, reverse, or title.' }, { quoted: msg });
    }
    await sock.sendMessage(chatId, { text: result }, { quoted: msg });
  }
};
