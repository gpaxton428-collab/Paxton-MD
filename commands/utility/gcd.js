function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }

export default {
  name: 'gcd',
  alias: ['lcm'],
  description: 'Get the GCD and LCM of two numbers. Usage: .gcd 12 18',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const a = parseInt(args[0], 10);
    const b = parseInt(args[1], 10);
    if (isNaN(a) || isNaN(b) || a <= 0 || b <= 0) return sock.sendMessage(chatId, { text: '❌ Usage: .gcd <num1> <num2>' }, { quoted: msg });
    const g = gcd(a, b);
    const l = (a * b) / g;
    await sock.sendMessage(chatId, { text: `🔢 GCD: ${g} | LCM: ${l}` }, { quoted: msg });
  }
};
