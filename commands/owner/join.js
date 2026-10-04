import { safeErrorMessage } from '../../lib/utils/errors.js';
export default {
  name: 'join',
  ownerOnly: true,
  strictOwner: true,
  description: 'Make the bot join a group via invite link (owner only). Usage: .join <link>',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const match = (args[0] || '').match(/^https?:\/\/chat\.whatsapp\.com\/([A-Za-z0-9]{20,24})(?:[?#].*)?$/);
    if (!match) return sock.sendMessage(chatId, { text: '❌ Usage: .join <https://chat.whatsapp.com/... invite link>' }, { quoted: msg });
    const code = match[1];
    try {
      await sock.groupAcceptInvite(code);
      await sock.sendMessage(chatId, { text: '✅ Joined the group.' }, { quoted: msg });
    } catch (error) {
      await sock.sendMessage(chatId, { text: `❌ Failed to join: ${safeErrorMessage(error)}` }, { quoted: msg });
    }
  }
};
