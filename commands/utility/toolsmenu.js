export default {
  name: 'toolsmenu',
  description: 'Show only the utility/tools-category commands. Usage: .toolsmenu',
  async execute(sock, msg, args, currentPrefix, ctx) {
    const chatId = msg.key.remoteJid;
    const cmds = ctx.commandCategories.get('utility') || [];
    const text = `🧰 *Tools & Utility Menu*\n${cmds.map((c) => `${currentPrefix}${c}`).join('\n')}`;
    await sock.sendMessage(chatId, { text }, { quoted: msg });
  }
};
