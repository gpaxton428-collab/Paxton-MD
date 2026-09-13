export default {
  name: 'luckynumber',
  description: "Get today's lucky number. Usage: .luckynumber",
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    const num = Math.floor(Math.random() * 100) + 1;
    await sock.sendMessage(chatId, { text: `🍀 Your lucky number today is *${num}*!` }, { quoted: msg });
  }
};
