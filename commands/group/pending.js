import { isSenderAdmin, replyText } from '../../lib/groupHelper.js';

export default {
  name: 'pending',
  description: 'List everyone waiting for group join approval (admin only). Usage: .pending',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    if (!chatId.endsWith('@g.us')) return replyText(sock, msg, '❌ This command only works in groups.');
    const sender = msg.key.participant || msg.key.remoteJid;
    if (!(await isSenderAdmin(sock, chatId, sender))) return replyText(sock, msg, '❌ Only group admins can use this command.');
    try {
      const pending = await sock.groupRequestParticipantsList(chatId);
      if (!pending?.length) return replyText(sock, msg, 'ℹ️ No pending join requests right now.');
      const list = pending.map((p, i) => `${i + 1}. @${p.jid.split('@')[0]}`).join('\n');
      await sock.sendMessage(chatId, { text: `📋 *Pending Join Requests (${pending.length})*\n\n${list}`, mentions: pending.map((p) => p.jid) }, { quoted: msg });
    } catch (error) {
      await replyText(sock, msg, `❌ Failed: ${error.message}`);
    }
  }
};
