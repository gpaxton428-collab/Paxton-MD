export default {
  name: 'memcheck',
  ownerOnly: true,
  description: 'Show detailed memory usage breakdown (owner only). Usage: .memcheck',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    const mem = process.memoryUsage();
    const mb = (n) => (n / 1024 / 1024).toFixed(1);
    const text = `🧠 *Memory Usage*

` +
      `RSS: ${mb(mem.rss)} MB
` +
      `Heap used: ${mb(mem.heapUsed)} MB
` +
      `Heap total: ${mb(mem.heapTotal)} MB
` +
      `External: ${mb(mem.external)} MB`;
    await sock.sendMessage(chatId, { text }, { quoted: msg });
  }
};
