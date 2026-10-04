import { isSenderAdmin, replyText } from '../../lib/groupHelper.js';

export default {
  name: 'nuke',
  description: "⚠️ Bulk-delete the bot's own recent messages in this chat (admin only, group chats). Usage: .nuke <count, max 100>",
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    if (!chatId.endsWith('@g.us')) return replyText(sock, msg, '❌ This command only works in groups.');
    const sender = msg.key.participant || msg.key.remoteJid;
    if (!(await isSenderAdmin(sock, chatId, sender))) return replyText(sock, msg, '❌ Only group admins can use this command.');

    const count = Math.min(parseInt(args[0], 10) || 20, 100);
    const sentKeys = global.__paxtonSentMessages?.get(chatId) || [];
    if (!sentKeys.length) return replyText(sock, msg, 'ℹ️ No tracked bot messages to delete in this chat yet.');

    const toDelete = sentKeys.slice(-count);
    let deleted = 0;
    for (const key of toDelete) {
      try { await sock.sendMessage(chatId, { delete: key }); deleted++; } catch {}
    }
    global.__paxtonSentMessages.set(chatId, sentKeys.slice(0, -count));
    await replyText(sock, msg, `💣 Deleted ${deleted} of the bot's own message(s) here.`);
  }
};
