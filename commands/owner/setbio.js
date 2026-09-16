export default {
  name: 'setbio',
  ownerOnly: true,
  description: "Set the bot's WhatsApp About/bio text (owner only). Usage: .setbio Powered by Paxton MD",
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const text = args.join(' ').trim();
    if (!text) return sock.sendMessage(chatId, { text: '❌ Usage: .setbio <text>' }, { quoted: msg });
    try {
      await sock.updateProfileStatus(text);
      await sock.sendMessage(chatId, { text: `✅ Bio updated to: ${text}` }, { quoted: msg });
    } catch (error) {
      await sock.sendMessage(chatId, { text: `❌ Failed: ${error.message}` }, { quoted: msg });
    }
  }
};
