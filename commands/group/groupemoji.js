import { isSenderAdmin, replyText } from '../../lib/groupHelper.js';
import { setGroupSetting } from '../../lib/settingsStore.js';

export default {
  name: 'groupemoji',
  description: 'Set the emoji used in default welcome/goodbye messages for this group. Usage: .groupemoji 🎉',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    if (!chatId.endsWith('@g.us')) return replyText(sock, msg, '❌ This command only works in groups.');
    const sender = msg.key.participant || msg.key.remoteJid;
    if (!(await isSenderAdmin(sock, chatId, sender))) return replyText(sock, msg, '❌ Only group admins can use this command.');
    const emoji = args[0];
    if (!emoji) return replyText(sock, msg, '❌ Usage: .groupemoji <emoji>');
    setGroupSetting(chatId, 'groupEmoji', emoji);
    await replyText(sock, msg, `✅ Group emoji set to ${emoji} — it'll show up in default welcome/goodbye messages.`);
  }
};
