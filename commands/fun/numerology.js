function digitSum(n) {
  while (n > 9) n = String(n).split('').reduce((a, d) => a + Number(d), 0);
  return n;
}
export default {
  name: 'numerology',
  description: "Get your numerology life-path number from your birth date. Usage: .numerology DD-MM-YYYY",
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const parts = (args[0] || '').split(/[-/]/).map(Number);
    if (parts.length !== 3 || parts.some(isNaN)) {
      return sock.sendMessage(chatId, { text: '❌ Usage: .numerology DD-MM-YYYY (e.g. .numerology 14-03-1998)' }, { quoted: msg });
    }
    const total = parts.reduce((a, b) => a + b, 0);
    const lifePath = digitSum(total);
    await sock.sendMessage(chatId, { text: `🔢 *Numerology*\nYour life-path number is: *${lifePath}*` }, { quoted: msg });
  }
};
