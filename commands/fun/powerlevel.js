export default {
  name: 'powerlevel',
  description: 'Get a random anime-style power level reading. Usage: .powerlevel',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    const level = Math.floor(Math.random() * 9000) + 1000;
    await sock.sendMessage(chatId, { text: `⚡ *Power Level:* ${level.toLocaleString()}\n${level > 9000 ? "IT'S OVER 9000!!" : 'Room to grow yet.'}` }, { quoted: msg });
  }
};
