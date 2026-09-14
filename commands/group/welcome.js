import { isSenderAdmin, replyText } from '../../lib/groupHelper.js';
import { getGroupSettings, setGroupSetting } from '../../lib/settingsStore.js';

export default {
  name: 'welcome',
  description: 'Toggle the welcome message for new members (admin only). Usage: .welcome on|off',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    if (!chatId.endsWith('@g.us')) return replyText(sock, msg, '❌ This command only works in groups.');
    const sender = msg.key.participant || msg.key.remoteJid;
    if (!(await isSenderAdmin(sock, chatId, sender))) return replyText(sock, msg, '❌ Only group admins can use this command.');
    const choice = (args[0] || '').toLowerCase();
    if (choice !== 'on' && choice !== 'off') {
      const settings = getGroupSettings(chatId);
      return replyText(sock, msg, `ℹ️ Welcome messages are currently *${settings.welcome ? 'ON' : 'OFF'}*.\nUsage: .welcome on|off`);
    }
    setGroupSetting(chatId, 'welcome', choice === 'on');
    await replyText(sock, msg, `✅ Welcome messages turned *${choice.toUpperCase()}*.`);
  }
};
