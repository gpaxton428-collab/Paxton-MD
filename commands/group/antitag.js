import { isSenderAdmin, replyText } from '../../lib/groupHelper.js';
import { getGroupSettings, setGroupSetting } from '../../lib/settingsStore.js';

export default {
  name: 'antitag',
  description: 'Toggle blocking non-admins from mass-mentioning the group (admin only). Usage: .antitag on|off',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    if (!chatId.endsWith('@g.us')) return replyText(sock, msg, '❌ This command only works in groups.');
    const sender = msg.key.participant || msg.key.remoteJid;
    if (!(await isSenderAdmin(sock, chatId, sender))) return replyText(sock, msg, '❌ Only group admins can use this command.');
    const choice = (args[0] || '').toLowerCase();
    if (choice !== 'on' && choice !== 'off') {
      const settings = getGroupSettings(chatId);
      return replyText(sock, msg, `ℹ️ Anti-tag is currently *${settings.antitag ? 'ON' : 'OFF'}*.\nUsage: .antitag on|off`);
    }
    setGroupSetting(chatId, 'antitag', choice === 'on');
    await replyText(sock, msg, `✅ Anti-tag turned *${choice.toUpperCase()}*. Non-admins who @mention 5+ people will be warned and their message removed.`);
  }
};
