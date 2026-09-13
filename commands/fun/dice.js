export default {
  name: 'dice',
  alias: ['roll'],
  description: 'Roll a dice. Usage: .dice (defaults to 1-6) or .dice 100 for 1-100',
  async execute(sock, msg, args) {
    const max = parseInt(args[0], 10) || 6;
    const result = Math.floor(Math.random() * max) + 1;
    await sock.sendMessage(msg.key.remoteJid, { text: `🎲 You rolled a *${result}* (1-${max})` }, { quoted: msg });
  }
};
