export default {
  name: 'ping2',
  description: 'Alternate style latency check.',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    const start = Date.now();
    const sent = await sock.sendMessage(chatId, { text: '🏓 Pinging...' }, { quoted: msg });
    const latency = Date.now() - start;
    await sock.sendMessage(chatId, { text: `🏓 Pong! ${latency}ms`, edit: sent.key });
  }
};
