export default {
  name: 'onwhatsapp',
  alias: ['checknum'],
  description: 'Check if a phone number is registered on WhatsApp. Usage: .onwhatsapp <number>',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const number = args[0]?.replace(/[^0-9]/g, '');
    if (!number) return sock.sendMessage(chatId, { text: '❌ Usage: .onwhatsapp <number>' }, { quoted: msg });
    try {
      const [result] = await sock.onWhatsApp(number);
      if (result?.exists) {
        await sock.sendMessage(chatId, { text: `✅ +${number} is on WhatsApp.` }, { quoted: msg });
      } else {
        await sock.sendMessage(chatId, { text: `❌ +${number} is not on WhatsApp.` }, { quoted: msg });
      }
    } catch (error) {
      await sock.sendMessage(chatId, { text: `❌ Check failed: ${error.message}` }, { quoted: msg });
    }
  }
};
