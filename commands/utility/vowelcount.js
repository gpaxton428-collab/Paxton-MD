export default {
  name: 'vowelcount',
  description: 'Count the vowels in a piece of text. Usage: .vowelcount hello world',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const text = args.join(' ');
    if (!text) return sock.sendMessage(chatId, { text: '❌ Usage: .vowelcount <text>' }, { quoted: msg });
    const count = (text.match(/[aeiouAEIOU]/g) || []).length;
    await sock.sendMessage(chatId, { text: `🔡 Vowel count: ${count}` }, { quoted: msg });
  }
};
