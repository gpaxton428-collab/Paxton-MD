export default {
  name: 'nodeinfo',
  ownerOnly: true,
  description: 'Show Node.js/OS diagnostic info — useful for debugging hosting issues (owner only). Usage: .nodeinfo',
  async execute(sock, msg, args, currentPrefix, ctx) {
    const chatId = msg.key.remoteJid;
    const os = ctx.os;
    const mem = process.memoryUsage();
    const text = [
      '🛠️ *Node Diagnostic*',
      `Node: ${process.version}`,
      `Platform: ${process.platform} (${process.arch})`,
      `OS: ${os.type()} ${os.release()}`,
      `CPU cores: ${os.cpus().length}`,
      `Free RAM: ${(os.freemem() / 1024 / 1024).toFixed(0)}MB / ${(os.totalmem() / 1024 / 1024).toFixed(0)}MB`,
      `Process RSS: ${(mem.rss / 1024 / 1024).toFixed(1)}MB`,
      `Process uptime: ${Math.floor(process.uptime())}s`
    ].join('\n');
    await sock.sendMessage(chatId, { text }, { quoted: msg });
  }
};
