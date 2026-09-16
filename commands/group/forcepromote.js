import { getTargetJid, isBotAdmin, replyText } from '../../lib/groupHelper.js';

export default {
  name: 'forcepromote',
  ownerOnly: true,
  description: "Promote a member to admin, bypassing the normal group-admin requirement (owner only — for when you're not an admin yourself but need this done). Usage: reply to/mention them with .forcepromote",
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    if (!chatId.endsWith('@g.us')) return replyText(sock, msg, '❌ This command only works in groups.');
    if (!(await isBotAdmin(sock, chatId))) return replyText(sock, msg, '❌ I need to be an admin to do that.');
    const target = getTargetJid(msg, args);
    if (!target) return replyText(sock, msg, '❌ Reply to or mention the member you want to promote.');
    try {
      await sock.groupParticipantsUpdate(chatId, [target], 'promote');
      await replyText(sock, msg, `✅ Force-promoted @${target.split('@')[0]} to admin.`);
    } catch (error) {
      await replyText(sock, msg, `❌ Failed: ${error.message}`);
    }
  }
};
