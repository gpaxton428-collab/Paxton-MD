export default {
  name: 'setprefix',
  ownerOnly: true,
  description: "Change the bot's command prefix (owner only). Usage: .setprefix ! (or 'none' for no prefix)",
  async execute(sock, msg, args, prefix, ctx) {
    const chatId = msg.key.remoteJid;
    const newPrefix = args[0];
    if (!newPrefix) return sock.sendMessage(chatId, { text: "❌ Usage: .setprefix <symbol> (or 'none')" }, { quoted: msg });
    const result = ctx.updatePrefix(newPrefix);
    if (result.success) {
      await sock.sendMessage(chatId, { text: `✅ Prefix changed to ${result.isPrefixless ? 'none (prefixless)' : `"${result.newPrefix}"`}.` }, { quoted: msg });
    } else {
      await sock.sendMessage(chatId, { text: `❌ ${result.error}` }, { quoted: msg });
    }
  }
};
