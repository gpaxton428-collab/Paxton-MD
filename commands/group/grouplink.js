import { isSenderAdmin, replyText } from '../../lib/groupHelper.js';

export default {
  name: 'grouplink',
  alias: ['invitelink'],
  description: 'Get the group invite link (admin only).',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    if (!chatId.endsWith('@g.us')) return replyText(sock, msg, '❌ This command only works in groups.');
    const sender = msg.key.participant || msg.key.remoteJid;
    if (!(await isSenderAdmin(sock, chatId, sender))) return replyText(sock, msg, '❌ Only group admins can use this command.');
    try {
      const code = await sock.groupInviteCode(chatId);
      await replyText(sock, msg, `🔗 https://chat.whatsapp.com/${code}`);
    } catch (error) {
      await replyText(sock, msg, `❌ Failed to get invite link: ${error.message}`);
    }
  }
};
