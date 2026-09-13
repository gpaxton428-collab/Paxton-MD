export default {
  name: 'botinfo',
  alias: ['about'],
  description: 'Show basic information about the bot.',
  async execute(sock, msg, args, prefix, ctx) {
    const text = `🤖 *${ctx.BOT_NAME}*\n\n` +
      `📦 Version: ${ctx.VERSION}\n` +
      `💬 Prefix: ${ctx.getCurrentPrefix() || 'none (prefixless)'}\n` +
      `👑 Owner: Paxton\n` +
      `📡 Status: 🟢 Online`;
    await sock.sendMessage(msg.key.remoteJid, { text }, { quoted: msg });
  }
};
