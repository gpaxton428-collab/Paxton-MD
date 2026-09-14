import { isSenderAdmin, replyText } from '../../lib/groupHelper.js';
import { getGroupSettings, setGroupSetting } from '../../lib/settingsStore.js';

export default {
  name: 'antisticker',
  description: 'Toggle automatic removal of stickers from chat (admin only). Usage: .antisticker on|off',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    if (!chatId.endsWith('@g.us')) return replyText(sock, msg, '❌ This command only works in groups.');
    const sender = msg.key.participant || msg.key.remoteJid;
    if (!(await isSenderAdmin(sock, chatId, sender))) return replyText(sock, msg, '❌ Only group admins can use this command.');
    const choice = (args[0] || '').toLowerCase();
    if (!['on', 'off'].includes(choice)) {
      const settings = getGroupSettings(chatId);
      return replyText(sock, msg, `ℹ️ Anti-sticker is currently *${settings.antisticker ? 'ON' : 'OFF'}*.\nUsage: .antisticker on|off`);
    }
    setGroupSetting(chatId, 'antisticker', choice === 'on');
    await replyText(sock, msg, `✅ Anti-sticker turned *${choice.toUpperCase()}*.`);
  }
};
