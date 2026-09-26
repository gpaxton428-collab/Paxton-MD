import { isSenderAdmin, replyText } from '../../lib/groupHelper.js';
import { getGroupSettings, setGroupSetting } from '../../lib/settingsStore.js';
import { replyWithActions, antiActions } from '../../lib/helpers/actionReply.js';

export default {
  name: 'antimention',
  description: 'Toggle removal of any message that @mentions someone (admin only) — stricter than .antitag, which only catches mass-tagging (5+). Usage: .antimention on|off',
  async execute(sock, msg, args, prefix) {
    const chatId = msg.key.remoteJid;
    if (!chatId.endsWith('@g.us')) return replyText(sock, msg, '❌ This command only works in groups.');
    const sender = msg.key.participant || msg.key.remoteJid;
    if (!(await isSenderAdmin(sock, chatId, sender))) return replyText(sock, msg, '❌ Only group admins can use this command.');
    const choice = (args[0] || '').toLowerCase();
    const mode = (args[1] || '').toLowerCase();
    if (!['on', 'off'].includes(choice)) {
      const settings = getGroupSettings(chatId);
      return replyWithActions(sock, msg, `ℹ️ Anti-mention is currently *${settings.antimention ? 'ON' : 'OFF'}*, action: *${settings.antimentionAction || 'delete'}*.\nUsage: .antimention on|off [delete|warn|kick]`, antiActions(prefix, 'antimention'));
    }
    setGroupSetting(chatId, 'antimention', choice === 'on');
    if (['delete', 'warn', 'kick'].includes(mode)) setGroupSetting(chatId, 'antimentionAction', mode);
    const updated = getGroupSettings(chatId);
    await replyWithActions(sock, msg, `✅ Anti-mention turned *${choice.toUpperCase()}*, action: *${updated.antimentionAction || 'delete'}*.`, antiActions(prefix, 'antimention'));
  }
};
