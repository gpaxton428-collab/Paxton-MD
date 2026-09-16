export default {
  name: 'groupmenu',
  description: 'Show only the group-category commands. Usage: .groupmenu',
  async execute(sock, msg, args, currentPrefix, ctx) {
    const chatId = msg.key.remoteJid;
    const cmds = ctx.commandCategories.get('group') || [];
    const text = `👥 *Group Menu*\n${cmds.map((c) => `${currentPrefix}${c}`).join('\n')}`;
    await sock.sendMessage(chatId, { text }, { quoted: msg });
  }
};
