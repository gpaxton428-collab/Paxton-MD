export default {
  name: 'ghostarchive',
  ownerOnly: true,
  description: "Toggle saving everyone else's status posts to your DM before they expire or get deleted (owner only). Usage: .ghostarchive on|off",
  async execute(sock, msg, args, currentPrefix, ctx) {
    const chatId = msg.key.remoteJid;
    const choice = (args[0] || '').toLowerCase();
    if (!['on', 'off'].includes(choice)) {
      const settings = ctx.getGlobalSettings();
      return sock.sendMessage(chatId, { text: `ℹ️ Ghost Archive is currently *${settings.ghostArchive ? 'ON' : 'OFF'}*.\nUsage: .ghostarchive on|off` }, { quoted: msg });
    }
    ctx.setGlobalSetting('ghostArchive', choice === 'on');
    await sock.sendMessage(chatId, { text: `✅ Ghost Archive turned *${choice.toUpperCase()}*.` }, { quoted: msg });
  }
};
