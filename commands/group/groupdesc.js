import { isSenderAdmin, isBotAdmin, replyText } from '../../lib/groupHelper.js';

export default {
  name: 'groupdesc',
  alias: ['setdesc'],
  description: 'Change the group description (admin only). Usage: .groupdesc New description',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    if (!chatId.endsWith('@g.us')) return replyText(sock, msg, '❌ This command only works in groups.');
    const sender = msg.key.participant || msg.key.remoteJid;
    if (!(await isSenderAdmin(sock, chatId, sender))) return replyText(sock, msg, '❌ Only group admins can use this command.');
    if (!(await isBotAdmin(sock, chatId))) return replyText(sock, msg, '❌ I need to be an admin to do that.');
    const newDesc = args.join(' ').trim();
    if (!newDesc) return replyText(sock, msg, '❌ Usage: .groupdesc <new description>');
    try {
      await sock.groupUpdateDescription(chatId, newDesc);
      await replyText(sock, msg, '✅ Group description updated.');
    } catch (error) {
      await replyText(sock, msg, `❌ Failed to change description: ${error.message}`);
    }
  }
};
