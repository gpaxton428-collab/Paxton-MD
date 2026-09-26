export default {
  name: 'community',
  alias: ['support'],
  description: "Get the link to join the bot's support/community group. Usage: .community",
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    const text = `👥 *Community Group*\n\nhttps://chat.whatsapp.com/GR3mXTP4NQ6Ldsea7jlGra\n\nJoin for support and updates.`;
    await sock.sendMessage(chatId, { text }, { quoted: msg });
  }
};
