export default {
  name: 'latency',
  description: 'Measure local event-loop response time.',
  ownerOnly: true,
  strictOwner: true,
  async execute(sock, msg) {
    const start = process.hrtime.bigint();
    await new Promise((resolve) => setImmediate(resolve));
    const ms = Number(process.hrtime.bigint() - start) / 1e6;
    await sock.sendMessage(msg.key.remoteJid, { text: `⚡ *PAXTON SPEED*\n\n🏓 Event loop: *${ms.toFixed(2)}ms*\n🟢 Status: *ONLINE*` }, { quoted: msg });
  }
};
