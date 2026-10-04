import { isSenderAdmin, replyText } from '../../lib/groupHelper.js';
import { getGroupSettings, setGroupSetting } from '../../lib/settingsStore.js';

export default {
  name: 'autosavevcf',
  alias: ['autosave'],
  description: 'Automatically save any contact card (vCard) shared in this group, so an admin can review them later. Usage: .autosavevcf on|off',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    if (!chatId.endsWith('@g.us')) return replyText(sock, msg, '❌ This command only works in groups.');
    const sender = msg.key.participant || msg.key.remoteJid;
    const choice = (args[0] || '').toLowerCase();
    if (choice !== 'on' && choice !== 'off') {
      const settings = getGroupSettings(chatId);
      return replyText(sock, msg, `ℹ️ Auto-save vCards is currently *${settings.autosavevcf ? 'ON' : 'OFF'}*.\nUsage: .autosavevcf on|off`);
    }
    if (!(await isSenderAdmin(sock, chatId, sender))) return replyText(sock, msg, '❌ Only group admins can use this command.');
    setGroupSetting(chatId, 'autosavevcf', choice === 'on');
    await replyText(sock, msg, `✅ Auto-save vCards turned *${choice.toUpperCase()}* for this group.`);
  }
};
