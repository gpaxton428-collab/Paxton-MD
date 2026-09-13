import { isSenderAdmin, replyText } from '../../lib/groupHelper.js';

export default {
  name: 'mutebot',
  description: "Temporarily stop the bot from responding to non-admins in this group. Usage: .mutebot on|off",
  async execute(sock, msg, args, currentPrefix, ctx) {
    const chatId = msg.key.remoteJid;
    if (!chatId.endsWith('@g.us')) return replyText(sock, msg, '❌ This command only works in groups.');
    const sender = msg.key.participant || msg.key.remoteJid;
    if (!(await isSenderAdmin(sock, chatId, sender))) return replyText(sock, msg, '❌ Only group admins can use this command.');
    const choice = (args[0] || '').toLowerCase();
    if (choice !== 'on' && choice !== 'off') return replyText(sock, msg, '❌ Usage: .mutebot on|off');
    const settings = ctx.getGlobalSettings();
    const muted = settings.mutedGroups || [];
    const updated = choice === 'on' ? [...new Set([...muted, chatId])] : muted.filter((g) => g !== chatId);
    ctx.setGlobalSetting('mutedGroups', updated);
    await replyText(sock, msg, `✅ Bot is now *${choice === 'on' ? 'muted for non-admins' : 'unmuted'}* in this group.`);
  }
};
