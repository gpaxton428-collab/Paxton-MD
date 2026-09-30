import { isSenderAdmin, isBotAdmin, replyText } from '../../lib/groupHelper.js';

export default {
  name: 'mute',
  description: 'Mute the group so only admins can chat (admin only).',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    if (!chatId.endsWith('@g.us')) return replyText(sock, msg, '❌ This command only works in groups.');
    const sender = msg.key.participant || msg.key.remoteJid;
    if (!(await isSenderAdmin(sock, chatId, sender))) return replyText(sock, msg, '❌ Only group admins can use this command.');
    if (!(await isBotAdmin(sock, chatId))) return replyText(sock, msg, '❌ I need to be an admin to do that.');
    try {
      await sock.groupSettingUpdate(chatId, 'announcement');
      await replyText(sock, msg, '🔇 Group muted — only admins can send messages.');
    } catch (error) {
      await replyText(sock, msg, `❌ Failed to lock group: ${error.message}`);
    }
  }
};
