import { getTargetJid, isSenderAdmin, replyText } from '../../lib/groupHelper.js';
import { resetWarning } from '../../lib/settingsStore.js';

export default {
  name: 'resetwarn',
  description: 'Clear a member\'s warnings (admin only).',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    if (!chatId.endsWith('@g.us')) return replyText(sock, msg, '❌ This command only works in groups.');
    const sender = msg.key.participant || msg.key.remoteJid;
    if (!(await isSenderAdmin(sock, chatId, sender))) return replyText(sock, msg, '❌ Only group admins can use this command.');
    const target = getTargetJid(msg, args);
    if (!target) return replyText(sock, msg, '❌ Reply to or mention the member whose warnings to reset.');
    resetWarning(chatId, target);
    await replyText(sock, msg, `✅ Warnings cleared for @${target.split('@')[0]}.`);
  }
};
