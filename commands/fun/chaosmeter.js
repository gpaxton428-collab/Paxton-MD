export default {
  name: 'chaosmeter',
  description: "Measure someone's chaos energy today. Usage: .chaosmeter [@mention]",
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const target = args[0] || 'You';
    const level = Math.floor(Math.random() * 101);
    await sock.sendMessage(chatId, { text: `🌀 *Chaos Meter*\n${target}: ${level}% chaotic today.` }, { quoted: msg });
  }
};
