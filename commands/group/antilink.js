import { isSenderAdmin, replyText } from '../../lib/groupHelper.js';
import { getGroupSettings, setGroupSetting } from '../../lib/settingsStore.js';

export default {
  name: 'antilink',
  description: 'Toggle automatic removal of links from chat (admin only). Usage: .antilink on|off|all — "on" only removes WhatsApp group invite links, "all" removes any link (youtube, instagram, etc).',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    if (!chatId.endsWith('@g.us')) return replyText(sock, msg, '❌ This command only works in groups.');
    const sender = msg.key.participant || msg.key.remoteJid;
    if (!(await isSenderAdmin(sock, chatId, sender))) return replyText(sock, msg, '❌ Only group admins can use this command.');
    const choice = (args[0] || '').toLowerCase();
    if (!['on', 'off', 'all'].includes(choice)) {
      const settings = getGroupSettings(chatId);
      const modeLabel = settings.antilink ? (settings.antilinkMode === 'all' ? 'ON (all links)' : 'ON (invite links only)') : 'OFF';
      return replyText(sock, msg, `ℹ️ Anti-link is currently *${modeLabel}*.\nUsage: .antilink on|off|all`);
    }
    if (choice === 'off') {
      setGroupSetting(chatId, 'antilink', false);
      return replyText(sock, msg, '✅ Anti-link turned *OFF*.');
    }
    setGroupSetting(chatId, 'antilink', true);
    setGroupSetting(chatId, 'antilinkMode', choice === 'all' ? 'all' : 'invite');
    await replyText(sock, msg, choice === 'all'
      ? '✅ Anti-link turned *ON* — removing *all* links (youtube, instagram, etc), not just group invites.'
      : '✅ Anti-link turned *ON* — removing WhatsApp group invite links only. Use `.antilink all` to block every link.');
  }
};
