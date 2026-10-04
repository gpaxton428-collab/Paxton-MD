export default {
  name: 'percentage',
  alias: ['percent'],
  description: 'Calculate what percentage one number is of another. Usage: .percentage 25 200',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const part = parseFloat(args[0]);
    const whole = parseFloat(args[1]);
    if (isNaN(part) || isNaN(whole) || whole === 0) return sock.sendMessage(chatId, { text: '❌ Usage: .percentage <part> <whole>' }, { quoted: msg });
    const result = ((part / whole) * 100).toFixed(2);
    await sock.sendMessage(chatId, { text: `📊 ${part} is ${result}% of ${whole}` }, { quoted: msg });
  }
};
