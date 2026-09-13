export default {
  name: 'alive',
  description: "Check that the bot is alive and see basic status. Usage: .alive",
  async execute(sock, msg, args, currentPrefix, ctx) {
    const chatId = msg.key.remoteJid;
    const uptimeSec = process.uptime();
    const h = Math.floor(uptimeSec / 3600);
    const m = Math.floor((uptimeSec % 3600) / 60);
    const text = `╭─⌈ 🌑 *${ctx.BOT_NAME} IS ALIVE* ⌋\n│\n│ ✧ *Status:* 🟢 Online\n│ ✧ *Uptime:* ${h}h ${m}m\n│ ✧ *Prefix:* ${ctx.isPrefixless ? 'none' : currentPrefix}\n│\n╰⊷ *Powered by ${ctx.BOT_NAME}*`;
    await sock.sendMessage(chatId, { text, contextInfo: ctx.channelContextInfo() }, { quoted: msg });
  }
};
