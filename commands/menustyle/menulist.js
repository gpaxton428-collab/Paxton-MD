export default {
  name: 'menulist',
  description: 'Show every command category and how many commands are in each. Usage: .menulist',
  async execute(sock, msg, args, currentPrefix, ctx) {
    const chatId = msg.key.remoteJid;
    const labels = { ai: '🤖 AI', dev: '🛠️ Dev', fun: '🎲 Fun', group: '👥 Group', media: '🖼️ Media & Stickers', menustyle: '🎨 Menu Styles', owner: '👑 Owner', settings: '⚙️ Bot Settings', utility: '🧰 Tools & Utility' };
    let text = `📋 *Menu List*\n\n`;
    for (const [cat, cmds] of ctx.commandCategories.entries()) {
      text += `${labels[cat] || cat.toUpperCase()}: ${cmds.length} commands\n`;
    }
    text += `\nTotal: ${ctx.getTotalCommandCount()} commands\nUse *${currentPrefix}menu*, *${currentPrefix}toolsmenu*, *${currentPrefix}ownermenu*, *${currentPrefix}funmenu*, *${currentPrefix}groupmenu*, *${currentPrefix}mediamenu* to browse by category.`;
    await sock.sendMessage(chatId, { text }, { quoted: msg });
  }
};
