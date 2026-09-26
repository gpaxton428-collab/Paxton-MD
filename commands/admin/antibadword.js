import { isSenderAdmin, replyText } from '../../lib/groupHelper.js';
import { getGroupSettings, setGroupSetting } from '../../lib/settingsStore.js';
import { replyWithActions, antiActions } from '../../lib/helpers/actionReply.js';

export default {
  name: 'antibadword',
  description: 'Toggle automatic removal of messages containing bad words, and choose what happens (admin only). Usage: .antibadword on|off [delete|warn|kick]',
  async execute(sock, msg, args, prefix) {
    const chatId = msg.key.remoteJid;
    if (!chatId.endsWith('@g.us')) return replyText(sock, msg, '❌ This command only works in groups.');
    const sender = msg.key.participant || msg.key.remoteJid;
    if (!(await isSenderAdmin(sock, chatId, sender))) return replyText(sock, msg, '❌ Only group admins can use this command.');
    const choice = (args[0] || '').toLowerCase();
    const mode = (args[1] || '').toLowerCase();
    if (choice !== 'on' && choice !== 'off') {
      const settings = getGroupSettings(chatId);
      return replyWithActions(sock, msg, `ℹ️ Anti-badword is currently *${settings.antibadword ? 'ON' : 'OFF'}*, action: *${settings.antibadwordAction || 'delete'}*.\nUsage: .antibadword on|off [delete|warn|kick]`, antiActions(prefix, 'antibadword'));
    }
    setGroupSetting(chatId, 'antibadword', choice === 'on');
    if (['delete', 'warn', 'kick'].includes(mode)) setGroupSetting(chatId, 'antibadwordAction', mode);
    const settings = getGroupSettings(chatId);
    await replyWithActions(sock, msg, `✅ Anti-badword turned *${choice.toUpperCase()}*, action: *${settings.antibadwordAction || 'delete'}*.`, antiActions(prefix, 'antibadword'));
  }
};
