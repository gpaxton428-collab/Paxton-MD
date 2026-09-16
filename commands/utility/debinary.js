export default {
  name: 'debinary',
  description: 'Convert binary back to text. Usage: .debinary 01101000 01101001',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const text = args.join(' ');
    if (!text) return sock.sendMessage(chatId, { text: '❌ Usage: .debinary <binary>' }, { quoted: msg });
    try {
      const decoded = text.split(' ').filter(Boolean).map((b) => String.fromCharCode(parseInt(b, 2))).join('');
      await sock.sendMessage(chatId, { text: `💾 ${decoded}` }, { quoted: msg });
    } catch {
      await sock.sendMessage(chatId, { text: '❌ Invalid binary input.' }, { quoted: msg });
    }
  }
};
