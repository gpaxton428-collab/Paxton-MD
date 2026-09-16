import { isSenderAdmin, replyText } from '../../lib/groupHelper.js';
import { getGroupSettings, setGroupSetting } from '../../lib/settingsStore.js';

export default {
  name: 'antiimage',
  description: 'Toggle automatic removal of images from chat (admin only). Usage: .antiimage on|off',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    if (!chatId.endsWith('@g.us')) return replyText(sock, msg, '❌ This command only works in groups.');
    const sender = msg.key.participant || msg.key.remoteJid;
    if (!(await isSenderAdmin(sock, chatId, sender))) return replyText(sock, msg, '❌ Only group admins can use this command.');
    const choice = (args[0] || '').toLowerCase();
    const mode = (args[1] || '').toLowerCase();
    if (!['on', 'off'].includes(choice)) {
      const settings = getGroupSettings(chatId);
      return replyText(sock, msg, `ℹ️ Anti-image is currently *${settings.antiimage ? 'ON' : 'OFF'}*, action: *${settings.antiimageAction || 'delete'}*.\nUsage: .antiimage on|off [delete|warn|kick]`);
    }
    setGroupSetting(chatId, 'antiimage', choice === 'on');
    if (['delete', 'warn', 'kick'].includes(mode)) setGroupSetting(chatId, 'antiimageAction', mode);
    const updated = getGroupSettings(chatId);
    await replyText(sock, msg, `✅ Anti-image turned *${choice.toUpperCase()}*, action: *${updated.antiimageAction || 'delete'}*.`);
  }
};
