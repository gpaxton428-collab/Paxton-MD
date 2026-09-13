export default {
  name: 'reloadconfig',
  ownerOnly: true,
  description: 'Re-read global settings from disk into memory without restarting the bot (owner only). Usage: .reloadconfig',
  async execute(sock, msg, args, currentPrefix, ctx) {
    const chatId = msg.key.remoteJid;
    const settings = ctx.getGlobalSettings();
    await sock.sendMessage(chatId, { text: `✅ Config reloaded.\nMenu style: ${settings.menuStyle || 1}\nAlways online: ${settings.alwaysOnline ? 'ON' : 'OFF'}\nAnti-call: ${settings.anticall ? 'ON' : 'OFF'}\nAuto-bio: ${settings.autobio ? 'ON' : 'OFF'}` }, { quoted: msg });
  }
};
