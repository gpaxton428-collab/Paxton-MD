import { isSenderAdmin, isBotAdmin, replyText } from '../../lib/groupHelper.js';

export default {
  name: 'unmute',
  description: 'Unmute the group so everyone can chat again (admin only).',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    if (!chatId.endsWith('@g.us')) return replyText(sock, msg, '❌ This command only works in groups.');
    const sender = msg.key.participant || msg.key.remoteJid;
    if (!(await isSenderAdmin(sock, chatId, sender))) return replyText(sock, msg, '❌ Only group admins can use this command.');
    if (!(await isBotAdmin(sock, chatId))) return replyText(sock, msg, '❌ I need to be an admin to do that.');
    try {
      await sock.groupSettingUpdate(chatId, 'not_announcement');
      await replyText(sock, msg, '🔊 Group unmuted — everyone can chat again.');
    } catch (error) {
      await replyText(sock, msg, `❌ Failed to unlock group: ${error.message}`);
    }
  }
};
