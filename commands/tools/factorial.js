export default {
  name: 'factorial',
  description: 'Calculate the factorial of a number. Usage: .factorial 5',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const n = parseInt(args[0], 10);
    if (isNaN(n) || n < 0 || n > 170) return sock.sendMessage(chatId, { text: '❌ Usage: .factorial <0-170>' }, { quoted: msg });
    let result = 1n;
    for (let i = 2n; i <= BigInt(n); i++) result *= i;
    await sock.sendMessage(chatId, { text: `🧮 ${n}! = ${result.toString()}` }, { quoted: msg });
  }
};
