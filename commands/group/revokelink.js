import { isSenderAdmin, replyText } from '../../lib/groupHelper.js';

export default {
  name: 'revokelink',
  description: 'Reset the group invite link, invalidating the old one (admin only).',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    if (!chatId.endsWith('@g.us')) return replyText(sock, msg, '❌ This command only works in groups.');
    const sender = msg.key.participant || msg.key.remoteJid;
    if (!(await isSenderAdmin(sock, chatId, sender))) return replyText(sock, msg, '❌ Only group admins can use this command.');
    try {
      const code = await sock.groupRevokeInvite(chatId);
      await replyText(sock, msg, `✅ New invite link: https://chat.whatsapp.com/${code}`);
    } catch (error) {
      await replyText(sock, msg, `❌ Failed to revoke link: ${error.message}`);
    }
  }
};
