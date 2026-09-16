import { isSenderAdmin, replyText } from '../../lib/groupHelper.js';
import { getGroupSettings, setGroupSetting } from '../../lib/settingsStore.js';

export default {
  name: 'antifake',
  description: 'Auto-remove new joiners whose number isn\'t from an allowed country code (admin only). Set the allow-list first with .allowedcodes. Usage: .antifake on|off',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    if (!chatId.endsWith('@g.us')) return replyText(sock, msg, '❌ This command only works in groups.');
    const sender = msg.key.participant || msg.key.remoteJid;
    if (!(await isSenderAdmin(sock, chatId, sender))) return replyText(sock, msg, '❌ Only group admins can use this command.');
    const choice = (args[0] || '').toLowerCase();
    if (choice !== 'on' && choice !== 'off') {
      const settings = getGroupSettings(chatId);
      return replyText(sock, msg, `ℹ️ Anti-fake is currently *${settings.antifake ? 'ON' : 'OFF'}*.\nAllowed codes: ${settings.allowedCountryCodes?.length ? settings.allowedCountryCodes.join(', ') : 'none set — use .allowedcodes add <code>'}\nUsage: .antifake on|off`);
    }
    if (choice === 'on' && !getGroupSettings(chatId).allowedCountryCodes?.length) {
      return replyText(sock, msg, '❌ Set at least one allowed country code first: .allowedcodes add <code> (e.g. .allowedcodes add 27)');
    }
    setGroupSetting(chatId, 'antifake', choice === 'on');
    await replyText(sock, msg, `✅ Anti-fake turned *${choice.toUpperCase()}*.`);
  }
};
