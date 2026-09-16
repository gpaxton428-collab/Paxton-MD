export default {
  name: 'memcheck',
  ownerOnly: true,
  description: 'Show detailed memory usage breakdown (owner only). Usage: .memcheck',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    const mem = process.memoryUsage();
    const mb = (n) => (n / 1024 / 1024).toFixed(1);
    const text = `╭─❏ 🎨『 *MEMORY CHECK* 』🎨\n` +
      `├❏ RSS: ${mb(mem.rss)} MB\n` +
      `├❏ Heap used: ${mb(mem.heapUsed)} MB\n` +
      `├❏ Heap total: ${mb(mem.heapTotal)} MB\n` +
      `├❏ External: ${mb(mem.external)} MB\n` +
      `╰─❏ ᴘᴏᴡᴇʀᴇᴅ ʙʏ Paxton-Tech`;
    await sock.sendMessage(chatId, { text }, { quoted: msg });
  }
};
