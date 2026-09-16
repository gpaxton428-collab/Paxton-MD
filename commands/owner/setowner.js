export default {
  name: 'setowner',
  ownerOnly: true,
  description: 'Transfer bot ownership to a new number (owner only). Usage: .setowner 27691234567',
  async execute(sock, msg, args, prefix, ctx) {
    const chatId = msg.key.remoteJid;
    const digits = (args[0] || '').replace(/[^0-9]/g, '');
    if (digits.length < 8) return sock.sendMessage(chatId, { text: '❌ Usage: .setowner <phone number with country code>' }, { quoted: msg });
    const result = ctx.jidManager.setNewOwner(`${digits}@s.whatsapp.net`);
    if (result.success) {
      await sock.sendMessage(chatId, { text: `✅ Owner updated to +${digits}.` }, { quoted: msg });
    } else {
      await sock.sendMessage(chatId, { text: `❌ Failed to set owner: ${result.error}` }, { quoted: msg });
    }
  }
};
