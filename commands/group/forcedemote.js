import { getTargetJid, isBotAdmin, replyText } from '../../lib/groupHelper.js';

export default {
  name: 'forcedemote',
  ownerOnly: true,
  description: "Demote an admin, bypassing the normal group-admin requirement (owner only). Usage: reply to/mention them with .forcedemote",
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    if (!chatId.endsWith('@g.us')) return replyText(sock, msg, '❌ This command only works in groups.');
    if (!(await isBotAdmin(sock, chatId))) return replyText(sock, msg, '❌ I need to be an admin to do that.');
    const target = getTargetJid(msg, args);
    if (!target) return replyText(sock, msg, '❌ Reply to or mention the admin you want to demote.');
    try {
      await sock.groupParticipantsUpdate(chatId, [target], 'demote');
      await replyText(sock, msg, `✅ Force-demoted @${target.split('@')[0]}.`);
    } catch (error) {
      await replyText(sock, msg, `❌ Failed: ${error.message}`);
    }
  }
};
