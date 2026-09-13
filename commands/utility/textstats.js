export default {
  name: 'textstats',
  description: 'Get detailed stats on a piece of text (letters, digits, spaces, punctuation). Usage: .textstats <text>',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const text = args.join(' ');
    if (!text) return sock.sendMessage(chatId, { text: '❌ Usage: .textstats <text>' }, { quoted: msg });
    const letters = (text.match(/[a-zA-Z]/g) || []).length;
    const digits = (text.match(/[0-9]/g) || []).length;
    const spaces = (text.match(/\s/g) || []).length;
    const punctuation = (text.match(/[.,!?;:'"()\-]/g) || []).length;
    await sock.sendMessage(chatId, { text: `📊 *Text Stats*\nLetters: ${letters}\nDigits: ${digits}\nSpaces: ${spaces}\nPunctuation: ${punctuation}\nTotal: ${text.length}` }, { quoted: msg });
  }
};
