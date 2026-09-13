export default {
  name: 'gccollect',
  alias: ['freemem'],
  ownerOnly: true,
  description: 'Force a garbage collection pass to free up memory (owner only, needs --expose-gc). Usage: .gccollect',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    const before = process.memoryUsage().rss / 1024 / 1024;
    if (typeof global.gc === 'function') {
      global.gc();
      const after = process.memoryUsage().rss / 1024 / 1024;
      await sock.sendMessage(chatId, { text: `🧹 GC run.\nBefore: ${before.toFixed(1)}MB\nAfter: ${after.toFixed(1)}MB\nFreed: ${(before - after).toFixed(1)}MB` }, { quoted: msg });
    } else {
      await sock.sendMessage(chatId, { text: `ℹ️ Manual GC isn't exposed. Start the bot with \`node --expose-gc index.js\` to enable this.\nCurrent RSS: ${before.toFixed(1)}MB` }, { quoted: msg });
    }
  }
};
