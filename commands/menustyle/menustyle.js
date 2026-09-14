export default {
  name: 'menustyle',
  ownerOnly: true,
  description: 'Switch the .menu display style (owner only). Usage: .menustyle <1-8>',
  async execute(sock, msg, args, currentPrefix, ctx) {
    const { setGlobalSetting } = ctx;
    const chatId = msg.key.remoteJid;
    const choice = parseInt(args[0], 10);
    if (![1, 2, 3, 4, 5, 6, 7, 8].includes(choice)) {
      return sock.sendMessage(chatId, { text: `❌ Usage: ${currentPrefix}menustyle <1-8>\nUse ${currentPrefix}menu to preview the current style.\nUse ${currentPrefix}menupreview to see what each style looks like.` }, { quoted: msg });
    }
    setGlobalSetting('menuStyle', choice);
    await sock.sendMessage(chatId, { text: `✅ Menu style set to *${choice}*. Send ${currentPrefix}menu to see it.` }, { quoted: msg });
  }
};
