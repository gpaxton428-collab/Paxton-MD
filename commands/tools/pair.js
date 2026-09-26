export default {
  name: 'pair',
  alias: ['pairing'],
  description: "Get the link to pair a WhatsApp number to this bot. Usage: .pair",
  async execute(sock, msg, args, currentPrefix, ctx) {
    const chatId = msg.key.remoteJid;
    const text = `🔗 *Pair Your WhatsApp*\n\nhttps://paxton-md-session-generator.onrender.com/\n\nScan the QR code or use a pairing code to link a number to ${ctx.BOT_NAME}.`;
    await sock.sendMessage(chatId, { text }, { quoted: msg });
  }
};
