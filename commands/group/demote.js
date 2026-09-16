import { getTargetJid, isSenderAdmin, isBotAdmin, replyText } from '../../lib/groupHelper.js';

export default {
  name: 'demote',
  description: 'Demote a group admin back to member (admin only). Reply to or mention them.',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    if (!chatId.endsWith('@g.us')) return replyText(sock, msg, '❌ This command only works in groups.');
    const sender = msg.key.participant || msg.key.remoteJid;
    if (!(await isSenderAdmin(sock, chatId, sender))) return replyText(sock, msg, '❌ Only group admins can use this command.');
    if (!(await isBotAdmin(sock, chatId))) return replyText(sock, msg, '❌ I need to be an admin to do that.');
    const target = getTargetJid(msg, args);
    if (!target) return replyText(sock, msg, '❌ Reply to or mention the member you want to demote.');
    try {
      await sock.groupParticipantsUpdate(chatId, [target], 'demote');
      await replyText(sock, msg, `✅ Demoted @${target.split('@')[0]} to member.`);
    } catch (error) {
      await replyText(sock, msg, `❌ Failed to demote: ${error.message}`);
    }
  }
};
