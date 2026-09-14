export default {
  name: 'version',
  description: 'Show the bot version and Node.js runtime version.',
  async execute(sock, msg, args, prefix, ctx) {
    await sock.sendMessage(msg.key.remoteJid, { text: `📦 ${ctx.BOT_NAME} v${ctx.VERSION}\n🟢 Node ${process.version}` }, { quoted: msg });
  }
};
