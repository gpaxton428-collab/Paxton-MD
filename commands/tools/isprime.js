function isPrime(n) {
  if (n < 2) return false;
  for (let i = 2; i * i <= n; i++) if (n % i === 0) return false;
  return true;
}

export default {
  name: 'isprime',
  description: 'Check if a number is prime. Usage: .isprime 17',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const n = parseInt(args[0], 10);
    if (isNaN(n)) return sock.sendMessage(chatId, { text: '❌ Usage: .isprime <number>' }, { quoted: msg });
    await sock.sendMessage(chatId, { text: isPrime(n) ? `✅ ${n} is prime.` : `❌ ${n} is not prime.` }, { quoted: msg });
  }
};
