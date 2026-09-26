import { safeErrorMessage } from '../../lib/utils/errors.js';
import { isSenderAdmin, replyText } from '../../lib/groupHelper.js';
import { replyWithActions } from '../../lib/helpers/actionReply.js';

export default {
  name: 'pending',
  description: 'List everyone waiting for group join approval (admin only). Usage: .pending',
  async execute(sock, msg, args, prefix) {
    const chatId = msg.key.remoteJid;
    if (!chatId.endsWith('@g.us')) return replyText(sock, msg, '❌ This command only works in groups.');
    const sender = msg.key.participant || msg.key.remoteJid;
    if (!(await isSenderAdmin(sock, chatId, sender))) return replyText(sock, msg, '❌ Only group admins can use this command.');
    try {
      const pending = await sock.groupRequestParticipantsList(chatId);
      if (!pending?.length) return replyWithActions(sock, msg, 'ℹ️ No pending join requests right now.', [
        { text: '🔄 Refresh', id: `${prefix}pending` }
      ]);
      const list = pending.map((p, i) => `${i + 1}. @${p.jid.split('@')[0]}`).join('\n');
      await replyWithActions(sock, msg, `📋 *Pending Join Requests (${pending.length})*\n\n${list}`, [
        { text: '✅ Accept All', id: `${prefix}acceptall` },
        { text: '❌ Reject All', id: `${prefix}rejectall` },
        { text: '🔄 Refresh', id: `${prefix}pending` }
      ], '🛡️ Group approvals • Tap an action');
    } catch (error) {
      await replyText(sock, msg, `❌ Failed: ${safeErrorMessage(error)}`);
    }
  }
};
