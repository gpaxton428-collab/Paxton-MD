const VALUES = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
  [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];

export default {
  name: 'roman',
  description: 'Convert a number to Roman numerals. Usage: .roman 1994',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    let num = parseInt(args[0], 10);
    if (isNaN(num) || num <= 0 || num > 3999) return sock.sendMessage(chatId, { text: '❌ Usage: .roman <1-3999>' }, { quoted: msg });
    let result = '';
    for (const [value, symbol] of VALUES) { while (num >= value) { result += symbol; num -= value; } }
    await sock.sendMessage(chatId, { text: `🏛️ ${result}` }, { quoted: msg });
  }
};
