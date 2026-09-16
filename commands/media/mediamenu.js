export default {
  name: 'mediamenu',
  description: 'Show only the media/sticker-category commands. Usage: .mediamenu',
  async execute(sock, msg, args, currentPrefix, ctx) {
    const chatId = msg.key.remoteJid;
    const cmds = ctx.commandCategories.get('media') || [];
    const text = `🖼️ *Media & Stickers Menu*\n${cmds.map((c) => `${currentPrefix}${c}`).join('\n')}`;
    await sock.sendMessage(chatId, { text }, { quoted: msg });
  }
};
