export default {
  name: 'ownerpanel',
  ownerOnly: true,
  description: 'Quick overview of owner-relevant status: mode, prefix, sudo count, blacklist count (owner only). Usage: .ownerpanel',
  async execute(sock, msg, args, currentPrefix, ctx) {
    const chatId = msg.key.remoteJid;
    const settings = ctx.getGlobalSettings();
    const text = `╭─❏ 👑『 *OWNER PANEL* 』👑\n` +
      `├❏ 🌍 Mode: ${ctx.BOT_MODE}\n` +
      `├❏ 💬 Prefix: ${(ctx.getPrefixList?.() || [currentPrefix]).join(' ')}\n` +
      `├❏ 🚫 Blacklisted: ${(settings.globalBlacklist || []).length}\n` +
      `├❏ 📦 Total commands: ${ctx.getTotalCommandCount()}\n` +
      `╰─❏ ᴘᴏᴡᴇʀᴇᴅ ʙʏ Paxton-Tech`;
    await sock.sendMessage(chatId, { text }, { quoted: msg });
  }
};
