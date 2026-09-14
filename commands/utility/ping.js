export default {
  name: 'ping',
  description: "Check the bot's response latency and WhatsApp connection status. Usage: .ping",
  async execute(sock, msg, args, currentPrefix, ctx) {
    const chatId = msg.key.remoteJid;
    const start = Date.now();
    const sent = await sock.sendMessage(chatId, { text: '🏓 Pinging...' }, { quoted: msg });
    const ms = Date.now() - start;
    const connected = ctx.isWhatsAppConnected ? ctx.isWhatsAppConnected() : true;
    const text = `╭─⌈ 🏓 *PING RESPONSE* ⌋\n│\n│ ✧ *Latency:* ${ms}ms\n│ ✧ *WhatsApp Status:* ${connected ? '🟢 Connected' : '🔴 Disconnected'}\n│\n╰⊷ *Powered by ${ctx.BOT_NAME}*`;
    await sock.sendMessage(chatId, { text }, { edit: sent.key });
  }
};
