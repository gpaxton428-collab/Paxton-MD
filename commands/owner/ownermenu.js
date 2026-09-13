export default {
  name: 'ownermenu',
  ownerOnly: true,
  description: 'Show only the owner-category commands, without loading the full menu (owner only). Usage: .ownermenu',
  async execute(sock, msg, args, currentPrefix, ctx) {
    const chatId = msg.key.remoteJid;
    const ownerCmds = ctx.commandCategories.get('owner') || [];
    const devCmds = ctx.commandCategories.get('dev') || [];
    const text = `👑 *Owner Commands*\n${ownerCmds.map((c) => `${currentPrefix}${c}`).join('\n')}\n\n🛠️ *Dev Commands*\n${devCmds.map((c) => `${currentPrefix}${c}`).join('\n')}`;
    await sock.sendMessage(chatId, { text }, { quoted: msg });
  }
};
