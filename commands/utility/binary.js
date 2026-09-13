export default {
  name: 'binary',
  description: 'Convert text to binary. Usage: .binary hello',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const text = args.join(' ');
    if (!text) return sock.sendMessage(chatId, { text: '❌ Usage: .binary <text>' }, { quoted: msg });
    const encoded = text.split('').map((c) => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');
    await sock.sendMessage(chatId, { text: `💾 ${encoded}` }, { quoted: msg });
  }
};
