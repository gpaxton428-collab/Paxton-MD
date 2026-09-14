export default {
  name: 'funmenu',
  description: 'Show only the fun-category commands. Usage: .funmenu',
  async execute(sock, msg, args, currentPrefix, ctx) {
    const chatId = msg.key.remoteJid;
    const cmds = ctx.commandCategories.get('fun') || [];
    const text = `🎲 *Fun Menu*\n${cmds.map((c) => `${currentPrefix}${c}`).join('\n')}`;
    await sock.sendMessage(chatId, { text }, { quoted: msg });
  }
};
