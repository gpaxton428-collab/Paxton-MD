export default {
  name: 'removeprefix',
  ownerOnly: true,
  description: 'Remove one of several active prefixes (owner only). Usage: .removeprefix !',
  async execute(sock, msg, args, prefix, ctx) {
    const chatId = msg.key.remoteJid;
    const oldPrefix = args[0];
    if (!oldPrefix) return sock.sendMessage(chatId, { text: '❌ Usage: .removeprefix <symbol>' }, { quoted: msg });
    const result = ctx.removePrefixFromList(oldPrefix);
    if (result.success) {
      await sock.sendMessage(chatId, { text: `✅ Removed "${oldPrefix}".\nActive prefixes: ${result.prefixList.map((p) => `"${p}"`).join(', ')}` }, { quoted: msg });
    } else {
      await sock.sendMessage(chatId, { text: `❌ ${result.error}` }, { quoted: msg });
    }
  }
};
