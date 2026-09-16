export default {
  name: 'setownername',
  ownerOnly: true,
  description: "Set the display name shown for the owner in menus/status (separate from the owner's actual number). Usage: .setownername Paxton",
  async execute(sock, msg, args, currentPrefix, ctx) {
    const chatId = msg.key.remoteJid;
    const newName = args.join(' ').trim();
    if (!newName) return sock.sendMessage(chatId, { text: '❌ Usage: .setownername <name>' }, { quoted: msg });
    ctx.setGlobalSetting('ownerName', newName);
    await sock.sendMessage(chatId, { text: `✅ Owner display name set to *${newName}*.` }, { quoted: msg });
  }
};
