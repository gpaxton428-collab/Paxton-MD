import { getTargetJid, isSenderAdmin, isBotAdmin, replyText } from '../../lib/groupHelper.js';
import { addWarning } from '../../lib/settingsStore.js';

const MAX_WARNINGS = 3;

export default {
  name: 'warn',
  description: 'Warn a member. At 3 warnings they are removed (admin only).',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    if (!chatId.endsWith('@g.us')) return replyText(sock, msg, '❌ This command only works in groups.');
    const sender = msg.key.participant || msg.key.remoteJid;
    if (!(await isSenderAdmin(sock, chatId, sender))) return replyText(sock, msg, '❌ Only group admins can use this command.');
    const target = getTargetJid(msg, args);
    if (!target) return replyText(sock, msg, '❌ Reply to or mention the member you want to warn.');
    const count = addWarning(chatId, target);
    if (count >= MAX_WARNINGS && (await isBotAdmin(sock, chatId))) {
      try {
        await sock.groupParticipantsUpdate(chatId, [target], 'remove');
        return replyText(sock, msg, `⚠️ @${target.split('@')[0]} reached ${count} warnings and was removed.`);
      } catch {}
    }
    await replyText(sock, msg, `⚠️ @${target.split('@')[0]} warned (${count}/${MAX_WARNINGS}).`);
  }
};
