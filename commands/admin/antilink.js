import { isSenderAdmin, replyText } from '../../lib/groupHelper.js';
import { getGroupSettings, setGroupSetting } from '../../lib/settingsStore.js';

export default {
  name: 'antilink',
  description: 'Toggle automatic removal of links from chat, and choose what happens (admin only). Usage: .antilink on|off|all [delete|warn|kick] — "on" only removes WhatsApp group invite links, "all" removes any link (youtube, instagram, etc), in any order e.g. .antilink all kick.',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    if (!chatId.endsWith('@g.us')) return replyText(sock, msg, '❌ This command only works in groups.');
    const sender = msg.key.participant || msg.key.remoteJid;
    if (!(await isSenderAdmin(sock, chatId, sender))) return replyText(sock, msg, '❌ Only group admins can use this command.');

    const lowerArgs = args.map((a) => a.toLowerCase());
    const modeArg = lowerArgs.find((a) => ['on', 'off', 'all'].includes(a));
    const actionArg = lowerArgs.find((a) => ['delete', 'warn', 'kick'].includes(a));

    if (!modeArg) {
      const settings = getGroupSettings(chatId);
      const modeLabel = settings.antilink ? (settings.antilinkMode === 'all' ? 'ON (all links)' : 'ON (invite links only)') : 'OFF';
      return replyText(sock, msg, `ℹ️ Anti-link is currently *${modeLabel}*, action: *${settings.antilinkAction || 'delete'}*.\nUsage: .antilink on|off|all [delete|warn|kick]`);
    }
    if (modeArg === 'off') {
      setGroupSetting(chatId, 'antilink', false);
      return replyText(sock, msg, '✅ Anti-link turned *OFF*.');
    }
    setGroupSetting(chatId, 'antilink', true);
    setGroupSetting(chatId, 'antilinkMode', modeArg === 'all' ? 'all' : 'invite');
    if (actionArg) setGroupSetting(chatId, 'antilinkAction', actionArg);
    const settings = getGroupSettings(chatId);
    await replyText(sock, msg, (modeArg === 'all'
      ? '✅ Anti-link turned *ON* — removing *all* links (youtube, instagram, etc), not just group invites.'
      : '✅ Anti-link turned *ON* — removing WhatsApp group invite links only. Use `.antilink all` to block every link.'
    ) + `\nAction: *${settings.antilinkAction || 'delete'}*.`);
  }
};
