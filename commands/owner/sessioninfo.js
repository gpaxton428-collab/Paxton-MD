export default {
  name: 'sessioninfo',
  ownerOnly: true,
  description: 'Show details about the current login session (owner only).',
  async execute(sock, msg, args, prefix, ctx) {
    const chatId = msg.key.remoteJid;
    const user = sock.user || {};
    const text = `🔐 *Session Info*\n\n` +
      `Number: +${(user.id || '').split(':')[0].split('@')[0]}\n` +
      `Name: ${user.name || 'N/A'}\n` +
      `Platform: ${user.platform || 'N/A'}\n` +
      `Owner: +${ctx.OWNER_NUMBER || 'Not set'}\n` +
      `Bot: ${ctx.BOT_NAME} v${ctx.VERSION}`;
    await sock.sendMessage(chatId, { text }, { quoted: msg });
  }
};
