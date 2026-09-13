export default {
  name: 'join',
  ownerOnly: true,
  description: 'Make the bot join a group via invite link (owner only). Usage: .join <link>',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const link = args[0];
    if (!link || !link.includes('chat.whatsapp.com')) return sock.sendMessage(chatId, { text: '❌ Usage: .join <group invite link>' }, { quoted: msg });
    const code = link.split('/').pop();
    try {
      await sock.groupAcceptInvite(code);
      await sock.sendMessage(chatId, { text: '✅ Joined the group.' }, { quoted: msg });
    } catch (error) {
      await sock.sendMessage(chatId, { text: `❌ Failed to join: ${error.message}` }, { quoted: msg });
    }
  }
};
