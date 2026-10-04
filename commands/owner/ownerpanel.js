export default {
  name: 'ownerpanel',
  ownerOnly: true,
  description: 'Quick overview of owner-relevant status: mode, prefix, sudo count, blacklist count (owner only). Usage: .ownerpanel',
  async execute(sock, msg, args, currentPrefix, ctx) {
    const chatId = msg.key.remoteJid;
    const settings = ctx.getGlobalSettings();
    const text = `👑 *Owner Panel*

` +
      `Mode: ${ctx.BOT_MODE}
` +
      `Prefix: ${(ctx.getPrefixList?.() || [currentPrefix]).join(' ')}
` +
      `Blacklisted: ${(settings.globalBlacklist || []).length}
` +
      `Total commands: ${ctx.getTotalCommandCount()}`;
    await sock.sendMessage(chatId, { text }, { quoted: msg });
  }
};
