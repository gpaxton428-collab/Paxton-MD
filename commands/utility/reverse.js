export default {
  name: 'reverse',
  description: 'Reverse a piece of text. Usage: .reverse hello world',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const text = args.join(' ');
    if (!text) return sock.sendMessage(chatId, { text: '❌ Usage: .reverse <text>' }, { quoted: msg });
    await sock.sendMessage(chatId, { text: `🔁 ${text.split('').reverse().join('')}` }, { quoted: msg });
  }
};
