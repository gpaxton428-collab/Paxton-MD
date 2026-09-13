import { isSenderAdmin, replyText } from '../../lib/groupHelper.js';
import { getGroupSettings, setGroupSetting } from '../../lib/settingsStore.js';

export default {
  name: 'allowedcodes',
  description: 'Manage the country-code allow-list used by .antifake (admin only). Usage: .allowedcodes add|remove|list <code>',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    if (!chatId.endsWith('@g.us')) return replyText(sock, msg, '❌ This command only works in groups.');
    const sender = msg.key.participant || msg.key.remoteJid;
    if (!(await isSenderAdmin(sock, chatId, sender))) return replyText(sock, msg, '❌ Only group admins can use this command.');

    const sub = (args[0] || '').toLowerCase();
    const settings = getGroupSettings(chatId);
    const codes = new Set(settings.allowedCountryCodes || []);

    if (sub === 'list' || !sub) {
      return replyText(sock, msg, codes.size ? `📋 Allowed codes: ${[...codes].join(', ')}` : 'No allowed codes set yet. Usage: .allowedcodes add <code>');
    }
    const code = (args[1] || '').replace(/[^0-9]/g, '');
    if (!code) return replyText(sock, msg, '❌ Usage: .allowedcodes add|remove <code> (e.g. .allowedcodes add 27)');

    if (sub === 'add') {
      codes.add(code);
      setGroupSetting(chatId, 'allowedCountryCodes', [...codes]);
      return replyText(sock, msg, `✅ Added *${code}* to the allow-list.`);
    }
    if (sub === 'remove') {
      codes.delete(code);
      setGroupSetting(chatId, 'allowedCountryCodes', [...codes]);
      return replyText(sock, msg, `✅ Removed *${code}* from the allow-list.`);
    }
    await replyText(sock, msg, '❌ Usage: .allowedcodes add|remove|list <code>');
  }
};
