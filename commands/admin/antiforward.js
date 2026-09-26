import { isSenderAdmin, replyText } from '../../lib/groupHelper.js';
import { getGroupSettings, setGroupSetting } from '../../lib/settingsStore.js';
import { replyWithActions, antiActions } from '../../lib/helpers/actionReply.js';

export default {
  name: 'antiforward',
  description: 'Toggle removal of forwarded messages (admin only). Usage: .antiforward on|off',
  async execute(sock, msg, args, prefix) {
    const chatId = msg.key.remoteJid;
    if (!chatId.endsWith('@g.us')) return replyText(sock, msg, '❌ This command only works in groups.');
    const sender = msg.key.participant || msg.key.remoteJid;
    if (!(await isSenderAdmin(sock, chatId, sender))) return replyText(sock, msg, '❌ Only group admins can use this command.');
    const choice = (args[0] || '').toLowerCase();
    const mode = (args[1] || '').toLowerCase();
    if (!['on', 'off'].includes(choice)) {
      const settings = getGroupSettings(chatId);
      return replyWithActions(sock, msg, `ℹ️ Anti-forward is currently *${settings.antiforward ? 'ON' : 'OFF'}*, action: *${settings.antiforwardAction || 'delete'}*.\nUsage: .antiforward on|off [delete|warn|kick]`, antiActions(prefix, 'antiforward'));
    }
    setGroupSetting(chatId, 'antiforward', choice === 'on');
    if (['delete', 'warn', 'kick'].includes(mode)) setGroupSetting(chatId, 'antiforwardAction', mode);
    const updated = getGroupSettings(chatId);
    await replyWithActions(sock, msg, `✅ Anti-forward turned *${choice.toUpperCase()}*, action: *${updated.antiforwardAction || 'delete'}*.`, antiActions(prefix, 'antiforward'));
  }
};
