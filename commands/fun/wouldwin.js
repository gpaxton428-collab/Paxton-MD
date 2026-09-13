export default {
  name: 'wouldwin',
  description: 'Randomly decide who would win in a fight. Usage: .wouldwin Batman, Superman',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const parts = args.join(' ').split(',').map((p) => p.trim()).filter(Boolean);
    if (parts.length < 2) return sock.sendMessage(chatId, { text: '❌ Usage: .wouldwin <name1>, <name2>' }, { quoted: msg });
    const winner = parts[Math.floor(Math.random() * parts.length)];
    await sock.sendMessage(chatId, { text: `🏆 *${winner}* would win!` }, { quoted: msg });
  }
};
