export default {
  name: 'clapback',
  alias: ['clap'],
  description: 'Add 👏 claps between every word for emphasis. Usage: .clapback this is so important',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    if (!args.length) return sock.sendMessage(chatId, { text: '❌ Usage: .clapback <text>' }, { quoted: msg });
    const text = args.join(' 👏 ').toUpperCase();
    await sock.sendMessage(chatId, { text: `👏 ${text} 👏` }, { quoted: msg });
  }
};
