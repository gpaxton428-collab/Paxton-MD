export default {
  name: 'botcore',
  alias: ['core'],
  ownerOnly: true,
  description: 'Consolidated core health check — connection, memory, uptime, commands, last error (owner only). Usage: .botcore',
  async execute(sock, msg, args, currentPrefix, ctx) {
    const chatId = msg.key.remoteJid;
    const connected = ctx.isWhatsAppConnected ? ctx.isWhatsAppConnected() : true;
    const mem = process.memoryUsage();
    const uptimeSec = process.uptime();
    const h = Math.floor(uptimeSec / 3600), m = Math.floor((uptimeSec % 3600) / 60);
    const lastError = global.__paxtonLastError;
    const text = `🩺 *Bot Core*

` +
      `WhatsApp: ${connected ? 'Connected 🟢' : 'Disconnected 🔴'}
` +
      `Uptime: ${h}h ${m}m
` +
      `Memory: ${(mem.heapUsed / 1024 / 1024).toFixed(1)} MB used
` +
      `Prefix: ${(ctx.getPrefixList?.() || [currentPrefix]).join(' ')}
` +
      `Commands: ${ctx.getTotalCommandCount()}
` +
      `Last error: ${lastError ? lastError.time : 'none since startup'}`;
    await sock.sendMessage(chatId, { text }, { quoted: msg });
  }
};
