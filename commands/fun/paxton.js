export default {
  name: 'paxton',
  description: 'Learn a little about Paxton, the bot behind the bot. Usage: .paxton',
  async execute(sock, msg, args, currentPrefix, ctx) {
    const chatId = msg.key.remoteJid;
    const text = `🌑 *Who is Paxton?*\n\nPaxton is the name behind ${ctx.BOT_NAME} — built for group management, utility, and a bit of fun. Always watching from the shadows, always online. ⚡`;
    await sock.sendMessage(chatId, { text }, { quoted: msg });
  }
};
