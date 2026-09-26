export default {
  name: 'eventloop',
  alias: ['lag'],
  ownerOnly: true,
  description: "Measure event-loop lag — how long a timer takes to fire vs scheduled, a quick sign the process is overloaded (owner only). Usage: .eventloop",
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    const start = process.hrtime.bigint();
    await new Promise((resolve) => setTimeout(resolve, 50));
    const elapsedMs = Number(process.hrtime.bigint() - start) / 1e6;
    const lagMs = Math.max(0, elapsedMs - 50);
    const status = lagMs < 20 ? '🟢 healthy' : lagMs < 100 ? '🟡 elevated' : '🔴 overloaded';
    await sock.sendMessage(chatId, { text: `⏱️ *Event Loop Lag*\n${lagMs.toFixed(1)}ms — ${status}` }, { quoted: msg });
  }
};
