export default {
  name: 'countword',
  alias: ['wc'],
  description: 'Count words and characters in text. Usage: .countword <text>',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const text = args.join(' ');
    if (!text) return sock.sendMessage(chatId, { text: '❌ Usage: .countword <text>' }, { quoted: msg });
    const words = text.trim().split(/\s+/).length;
    await sock.sendMessage(chatId, { text: `📝 Words: ${words}\nCharacters: ${text.length}` }, { quoted: msg });
  }
};
