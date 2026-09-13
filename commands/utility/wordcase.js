export default {
  name: 'wordcase',
  alias: ['alternatecase'],
  description: 'Convert text to aLtErNaTiNg case. Usage: .wordcase hello world',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const text = args.join(' ');
    if (!text) return sock.sendMessage(chatId, { text: '❌ Usage: .wordcase <text>' }, { quoted: msg });
    const result = text.split('').map((c, i) => i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()).join('');
    await sock.sendMessage(chatId, { text: result }, { quoted: msg });
  }
};
