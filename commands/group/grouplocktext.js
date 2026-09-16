import { isSenderAdmin, replyText } from '../../lib/groupHelper.js';

export default {
  name: 'grouplocktext',
  description: 'Lock the group name and description so only admins can change them. Usage: .grouplocktext on|off',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    if (!chatId.endsWith('@g.us')) return replyText(sock, msg, '❌ This command only works in groups.');
    const sender = msg.key.participant || msg.key.remoteJid;
    if (!(await isSenderAdmin(sock, chatId, sender))) return replyText(sock, msg, '❌ Only group admins can use this command.');
    const choice = (args[0] || '').toLowerCase();
    if (choice !== 'on' && choice !== 'off') return replyText(sock, msg, '❌ Usage: .grouplocktext on|off');
    try {
      await sock.groupSettingUpdate(chatId, choice === 'on' ? 'locked' : 'unlocked');
      await replyText(sock, msg, `✅ Group name/description editing is now *${choice === 'on' ? 'admin-only' : 'open to everyone'}*.`);
    } catch (error) {
      await replyText(sock, msg, `❌ Failed: ${error.message}`);
    }
  }
};
