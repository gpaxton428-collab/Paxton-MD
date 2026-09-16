export default {
  name: 'stats',
  ownerOnly: true,
  description: 'Show bot resource and runtime stats (owner only).',
  async execute(sock, msg, args, prefix, ctx) {
    const mem = process.memoryUsage();
    const uptime = process.uptime();
    const text = `📊 *BOT STATS*\n\n🧠 RAM: ${Math.round(mem.rss / 1024 / 1024)}MB\n⏰ Uptime: ${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m\n🟢 Node: ${process.version}\n📦 Version: ${ctx.VERSION}\n🤖 Bot: ${ctx.BOT_NAME}`;
    await sock.sendMessage(msg.key.remoteJid, { text }, { quoted: msg });
  }
};
