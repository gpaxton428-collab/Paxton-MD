export default {
  name: 'addprefix',
  ownerOnly: true,
  description: 'Add an extra active prefix without replacing existing ones (owner only). Usage: .addprefix !',
  async execute(sock, msg, args, prefix, ctx) {
    const chatId = msg.key.remoteJid;
    const newPrefix = args[0];
    if (!newPrefix) return sock.sendMessage(chatId, { text: '❌ Usage: .addprefix <symbol>' }, { quoted: msg });
    const result = ctx.addPrefixToList(newPrefix);
    if (result.success) {
      await sock.sendMessage(chatId, { text: `✅ Added "${newPrefix}" as an active prefix.\nActive prefixes: ${result.prefixList.map((p) => `"${p}"`).join(', ')}` }, { quoted: msg });
    } else {
      await sock.sendMessage(chatId, { text: `❌ ${result.error}` }, { quoted: msg });
    }
  }
};
