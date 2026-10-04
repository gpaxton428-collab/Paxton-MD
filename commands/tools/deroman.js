const MAP = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };

export default {
  name: 'deroman',
  description: 'Convert Roman numerals to a number. Usage: .deroman MCMXCIV',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const roman = (args[0] || '').toUpperCase();
    if (!roman || !/^[IVXLCDM]+$/.test(roman)) return sock.sendMessage(chatId, { text: '❌ Usage: .deroman <roman numeral>' }, { quoted: msg });
    let total = 0;
    for (let i = 0; i < roman.length; i++) {
      const current = MAP[roman[i]];
      const next = MAP[roman[i + 1]];
      total += next && current < next ? -current : current;
    }
    await sock.sendMessage(chatId, { text: `🔢 ${total}` }, { quoted: msg });
  }
};
