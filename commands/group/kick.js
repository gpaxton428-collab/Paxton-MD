import { getTargetJid, isSenderAdmin, isBotAdmin, replyText } from '../../lib/groupHelper.js';

export default {
  name: 'kick',
  alias: ['remove'],
  description: 'Remove a member from the group (admin only). Reply to their message or mention them.',
  async execute(sock, msg, args, currentPrefix, ctx) {
    const chatId = msg.key.remoteJid;
    if (!chatId.endsWith('@g.us')) return replyText(sock, msg, '❌ This command only works in groups.');
    const sender = msg.key.participant || msg.key.remoteJid;
    if (!(await isSenderAdmin(sock, chatId, sender))) return replyText(sock, msg, '❌ Only group admins can use this command.');
    if (!(await isBotAdmin(sock, chatId))) return replyText(sock, msg, '❌ I need to be an admin to do that.');
    const target = getTargetJid(msg, args);
    if (!target) return replyText(sock, msg, '❌ Reply to or mention the member you want to remove.');
    try {
      await sock.groupParticipantsUpdate(chatId, [target], 'remove');
      const displayNumber = ctx?.resolveDisplayNumber ? await ctx.resolveDisplayNumber(target, chatId) : target.split('@')[0];
      await replyText(sock, msg, `✅ Removed @${displayNumber} from the group.`);
    } catch (error) {
      await replyText(sock, msg, `❌ Failed to remove: ${error.message}`);
    }
  }
};
