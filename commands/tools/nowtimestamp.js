export default {
  name: 'nowtimestamp',
  alias: ['epoch'],
  description: 'Get the current unix timestamp. Usage: .nowtimestamp',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    await sock.sendMessage(chatId, { text: `🕓 ${Math.floor(Date.now() / 1000)}` }, { quoted: msg });
  }
};
