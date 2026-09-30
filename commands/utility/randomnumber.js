export default {
  name: 'randomnumber',
  alias: ['rng'],
  description: 'Generate a random number in a range. Usage: .randomnumber 1 100',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const min = parseInt(args[0], 10);
    const max = parseInt(args[1], 10);
    if (isNaN(min) || isNaN(max) || min >= max) return sock.sendMessage(chatId, { text: '❌ Usage: .randomnumber <min> <max>' }, { quoted: msg });
    const result = Math.floor(Math.random() * (max - min + 1)) + min;
    await sock.sendMessage(chatId, { text: `🔢 ${result}` }, { quoted: msg });
  }
};
