const CONVERSIONS = {
  'km-mi': (v) => v * 0.621371,
  'mi-km': (v) => v / 0.621371,
  'kg-lb': (v) => v * 2.20462,
  'lb-kg': (v) => v / 2.20462,
  'c-f': (v) => (v * 9) / 5 + 32,
  'f-c': (v) => ((v - 32) * 5) / 9
};

export default {
  name: 'unitconvert',
  alias: ['convertunit'],
  description: 'Convert units. Usage: .unitconvert 10 km-mi (supports km-mi, mi-km, kg-lb, lb-kg, c-f, f-c)',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const value = parseFloat(args[0]);
    const type = args[1];
    if (isNaN(value) || !CONVERSIONS[type]) {
      return sock.sendMessage(chatId, { text: '❌ Usage: .unitconvert <value> <km-mi|mi-km|kg-lb|lb-kg|c-f|f-c>' }, { quoted: msg });
    }
    const result = CONVERSIONS[type](value).toFixed(2);
    await sock.sendMessage(chatId, { text: `🔁 ${value} → *${result}*` }, { quoted: msg });
  }
};
