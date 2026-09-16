import { isSenderAdmin, isBotAdmin, replyText } from '../../lib/groupHelper.js';

export default {
  name: 'add',
  description: 'Add a member to the group by phone number (admin only). Usage: .add 27691234567',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    if (!chatId.endsWith('@g.us')) return replyText(sock, msg, '❌ This command only works in groups.');
    const sender = msg.key.participant || msg.key.remoteJid;
    if (!(await isSenderAdmin(sock, chatId, sender))) return replyText(sock, msg, '❌ Only group admins can use this command.');
    if (!(await isBotAdmin(sock, chatId))) return replyText(sock, msg, '❌ I need to be an admin to do that.');
    const digits = (args[0] || '').replace(/[^0-9]/g, '');
    if (digits.length < 8) return replyText(sock, msg, '❌ Usage: .add <phone number with country code>');
    try {
      await sock.groupParticipantsUpdate(chatId, [`${digits}@s.whatsapp.net`], 'add');
      await replyText(sock, msg, `✅ Invited +${digits} to the group.`);
    } catch (error) {
      await replyText(sock, msg, `❌ Failed to add: ${error.message}`);
    }
  }
};
