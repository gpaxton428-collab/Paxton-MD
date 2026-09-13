import { isSenderAdmin, replyText } from '../../lib/groupHelper.js';
import { getGroupSettings, setGroupSetting } from '../../lib/settingsStore.js';

export default {
  name: 'antibadword',
  description: 'Toggle automatic deletion of messages containing bad words (admin only). Usage: .antibadword on|off',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    if (!chatId.endsWith('@g.us')) return replyText(sock, msg, '❌ This command only works in groups.');
    const sender = msg.key.participant || msg.key.remoteJid;
    if (!(await isSenderAdmin(sock, chatId, sender))) return replyText(sock, msg, '❌ Only group admins can use this command.');
    const choice = (args[0] || '').toLowerCase();
    if (choice !== 'on' && choice !== 'off') {
      const settings = getGroupSettings(chatId);
      return replyText(sock, msg, `ℹ️ Anti-badword is currently *${settings.antibadword ? 'ON' : 'OFF'}*.\nUsage: .antibadword on|off`);
    }
    setGroupSetting(chatId, 'antibadword', choice === 'on');
    await replyText(sock, msg, `✅ Anti-badword turned *${choice.toUpperCase()}*.`);
  }
};
