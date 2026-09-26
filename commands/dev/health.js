export default {
  name: 'health',
  description: 'Developer health snapshot: connection, uptime, memory and command count.',
  ownerOnly: true,
  strictOwner: true,
  async execute(sock, msg, args, prefix, ctx) {
    const mem = process.memoryUsage();
    const mb = (n) => Math.round(n / 1048576);
    const lines = [
      '╭━━〔 🩺 PAXTON HEALTH 〕━━╮',
      `┃ Status: ${ctx.isWhatsAppConnected?.() ? '🟢 ONLINE' : '🔴 OFFLINE'}`,
      `┃ Uptime: ${Math.floor(process.uptime())}s`,
      `┃ RSS: ${mb(mem.rss)} MB`,
      `┃ Heap: ${mb(mem.heapUsed)} / ${mb(mem.heapTotal)} MB`,
      `┃ Commands: ${ctx.getTotalCommandCount?.() ?? '—'}`,
      `┃ Node: ${process.version}`,
      '╰━━━━━━━━━━━━━━━━━━━━━━╯'
    ];
    await sock.sendMessage(msg.key.remoteJid, { text: lines.join('\n') }, { quoted: msg });
  }
};
