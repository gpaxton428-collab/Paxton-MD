import { isSenderAdmin, replyText } from '../../lib/groupHelper.js';
import { getGroupSettings } from '../../lib/settingsStore.js';

export default {
  name: 'welcometest',
  description: 'Preview the currently configured welcome message without a real join event. Usage: .welcometest',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    if (!chatId.endsWith('@g.us')) return replyText(sock, msg, '❌ This command only works in groups.');
    const sender = msg.key.participant || msg.key.remoteJid;
    if (!(await isSenderAdmin(sock, chatId, sender))) return replyText(sock, msg, '❌ Only group admins can use this command.');
    const settings = getGroupSettings(chatId);
    if (!settings.welcome) return replyText(sock, msg, 'ℹ️ Welcome messages are currently *OFF* for this group.');
    const template = settings.welcomeText || 'Welcome to the group, @user! 🎉';
    const preview = template.replace(/@user/gi, `@${sender.split('@')[0]}`);
    await sock.sendMessage(chatId, { text: `👋 *Preview:*\n${preview}`, mentions: [sender] }, { quoted: msg });
  }
};
