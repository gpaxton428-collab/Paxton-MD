export default {
  name: 'impaxton',
  alias: ["imapaxton"],
  description: "A little identity easter egg. Usage: .impaxton",
  async execute(sock, msg, args, currentPrefix, ctx) {
    const chatId = msg.key.remoteJid;
    const text = `🌑 *I'm Paxton.*\n\nBuilt from the shadows, running ${ctx.BOT_NAME} v${ctx.VERSION}.\n${ctx.commands.size} commands strong, always watching, always online. ⚡`;
    await sock.sendMessage(chatId, { text }, { quoted: msg });
  }
};
