import { isSenderAdmin, isBotAdmin, replyText } from '../../lib/groupHelper.js';

const DURATIONS = { off: 0, '24h': 86400, '7d': 604800, '90d': 7776000 };

export default {
  name: 'disappear',
  alias: ['ephemeral'],
  description: 'Toggle disappearing messages (admin only). Usage: .disappear off|24h|7d|90d',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    if (!chatId.endsWith('@g.us')) return replyText(sock, msg, '❌ This command only works in groups.');
    const sender = msg.key.participant || msg.key.remoteJid;
    if (!(await isSenderAdmin(sock, chatId, sender))) return replyText(sock, msg, '❌ Only group admins can use this command.');
    if (!(await isBotAdmin(sock, chatId))) return replyText(sock, msg, '❌ I need to be an admin to do that.');
    const choice = (args[0] || '').toLowerCase();
    if (!(choice in DURATIONS)) return replyText(sock, msg, '❌ Usage: .disappear off|24h|7d|90d');
    try {
      await sock.groupToggleEphemeral(chatId, DURATIONS[choice]);
      await replyText(sock, msg, choice === 'off' ? '✅ Disappearing messages turned off.' : `✅ Disappearing messages set to ${choice}.`);
    } catch (error) {
      await replyText(sock, msg, `❌ Failed: ${error.message}`);
    }
  }
};
