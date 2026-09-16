import { isSenderAdmin, replyText } from '../../lib/groupHelper.js';

export default {
  name: 'acceptall',
  alias: ['approveall'],
  description: 'Approve all pending group join requests (admin only, requires "Approve New Members" mode). Usage: .acceptall',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    if (!chatId.endsWith('@g.us')) return replyText(sock, msg, '❌ This command only works in groups.');
    const sender = msg.key.participant || msg.key.remoteJid;
    if (!(await isSenderAdmin(sock, chatId, sender))) return replyText(sock, msg, '❌ Only group admins can use this command.');
    try {
      const pending = await sock.groupRequestParticipantsList(chatId);
      if (!pending?.length) return replyText(sock, msg, 'ℹ️ No pending join requests right now.');
      const jids = pending.map((p) => p.jid);
      await sock.groupRequestParticipantsUpdate(chatId, jids, 'approve');
      await replyText(sock, msg, `✅ Approved ${jids.length} pending join request${jids.length === 1 ? '' : 's'}.`);
    } catch (error) {
      await replyText(sock, msg, `❌ Failed: ${error.message}`);
    }
  }
};
