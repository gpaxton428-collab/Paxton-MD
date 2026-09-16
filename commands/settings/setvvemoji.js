export default {
  name: 'setvvemoji',
  ownerOnly: true,
  description: "Set the emoji the bot quietly reacts with when it catches a view-once message (owner only). The capture itself always stays silent — this only changes the reaction, never adds a visible reply. Usage: .setvvemoji 👀",
  async execute(sock, msg, args, currentPrefix, ctx) {
    const chatId = msg.key.remoteJid;
    const emoji = args[0];
    if (!emoji) return sock.sendMessage(chatId, { text: '❌ Usage: .setvvemoji <emoji> (e.g. .setvvemoji 👑)' }, { quoted: msg });
    ctx.setGlobalSetting('vvEmoji', emoji);
    await sock.sendMessage(chatId, { text: `✅ View-once reaction emoji set to ${emoji}` }, { quoted: msg });
  }
};
