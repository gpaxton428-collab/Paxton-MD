export default {
  name: 'alive',
  description: "Check that the bot is alive and see basic status. Usage: .alive",
  async execute(sock, msg, args, currentPrefix, ctx) {
    const chatId = msg.key.remoteJid;
    const uptimeSec = process.uptime();
    const h = Math.floor(uptimeSec / 3600);
    const m = Math.floor((uptimeSec % 3600) / 60);
    const text = `🟢 *${ctx.BOT_NAME} is alive*

Uptime: ${h}h ${m}m
Prefix: ${ctx.isPrefixless ? 'none' : currentPrefix}`;
    const { replyWithActions } = await import('../../lib/helpers/actionReply.js');
    await replyWithActions(sock, msg, text, [
      { text: '🏓 Ping', id: `${currentPrefix}ping` },
      { text: '📦 Repo', id: `${currentPrefix}repo` },
      { text: '🏠 Main Menu', id: `${currentPrefix}menu` }
    ]);
  }
};
