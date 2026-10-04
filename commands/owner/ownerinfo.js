export default {
  name: 'ownerinfo',
  ownerOnly: true,
  description: 'Show the current bot owner details (owner only).',
  async execute(sock, msg, args, prefix, ctx) {
    const info = ctx.jidManager.getOwnerInfo();
    const text = `👑 *OWNER INFO*\n\n📞 Number: ${info.ownerNumber || 'Not set'}\n🆔 JID: ${info.ownerJid || 'Not set'}\n📋 Whitelist: ${info.whitelistCount}\n🕐 Linked: ${info.linkedAt || 'Unknown'}`;
    await sock.sendMessage(msg.key.remoteJid, { text }, { quoted: msg });
  }
};
