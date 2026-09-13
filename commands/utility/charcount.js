export default {
  name: 'charcount',
  description: 'Count the number of characters in a piece of text. Usage: .charcount hello world',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const text = args.join(' ');
    if (!text) return sock.sendMessage(chatId, { text: '❌ Usage: .charcount <text>' }, { quoted: msg });
    await sock.sendMessage(chatId, { text: `🔤 Characters: ${text.length} (no spaces: ${text.replace(/\s/g, '').length})` }, { quoted: msg });
  }
};
