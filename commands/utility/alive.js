export default {
  name: 'alive',
  description: "Check that the bot is up and responsive.",
  async execute(sock, msg, args, prefix, ctx) {
    const chatId = msg.key.remoteJid;
    const uptimeSec = process.uptime();
    const h = Math.floor(uptimeSec / 3600);
    const m = Math.floor((uptimeSec % 3600) / 60);
    await sock.sendMessage(chatId, { text: `✅ *${ctx.BOT_NAME}* is alive.\n⏰ Uptime: ${h}h ${m}m\n💬 Prefix: ${prefix}` }, { quoted: msg });
  }
};
