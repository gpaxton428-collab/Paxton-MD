import { isSenderAdmin, replyText } from '../../lib/groupHelper.js';
import { getGroupSettings, setGroupSetting } from '../../lib/settingsStore.js';

export default {
  name: 'antispam',
  description: 'Toggle flood/spam protection (admin only). Members sending more than 6 messages in 10 seconds get warned, then removed at 3 warnings. Usage: .antispam on|off',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    if (!chatId.endsWith('@g.us')) return replyText(sock, msg, '❌ This command only works in groups.');
    const sender = msg.key.participant || msg.key.remoteJid;
    if (!(await isSenderAdmin(sock, chatId, sender))) return replyText(sock, msg, '❌ Only group admins can use this command.');
    const choice = (args[0] || '').toLowerCase();
    if (choice !== 'on' && choice !== 'off') {
      const settings = getGroupSettings(chatId);
      return replyText(sock, msg, `ℹ️ Anti-spam is currently *${settings.antispam ? 'ON' : 'OFF'}*.\nUsage: .antispam on|off`);
    }
    setGroupSetting(chatId, 'antispam', choice === 'on');
    await replyText(sock, msg, `✅ Anti-spam turned *${choice.toUpperCase()}*.${choice === 'on' ? ' I need to be an admin to remove spammers.' : ''}`);
  }
};
