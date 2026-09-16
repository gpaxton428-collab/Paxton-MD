import { isSenderAdmin, replyText } from '../../lib/groupHelper.js';

export default {
  name: 'joinapproval',
  description: "Toggle WhatsApp's native 'admin must approve new members' mode (admin only). Usage: .joinapproval on|off",
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    if (!chatId.endsWith('@g.us')) return replyText(sock, msg, '❌ This command only works in groups.');
    const sender = msg.key.participant || msg.key.remoteJid;
    if (!(await isSenderAdmin(sock, chatId, sender))) return replyText(sock, msg, '❌ Only group admins can use this command.');
    const choice = (args[0] || '').toLowerCase();
    if (!['on', 'off'].includes(choice)) return replyText(sock, msg, '❌ Usage: .joinapproval on|off');
    if (typeof sock.groupJoinApprovalMode !== 'function') {
      return replyText(sock, msg, '❌ This Baileys version has no groupJoinApprovalMode() method — update @whiskeysockets/baileys.');
    }
    try {
      await sock.groupJoinApprovalMode(chatId, choice === 'on' ? 'on' : 'off');
      await replyText(sock, msg, `✅ Join approval turned *${choice.toUpperCase()}*. Use .pending / .acceptall / .rejectall to manage requests.`);
    } catch (error) {
      await replyText(sock, msg, `❌ Failed: ${error.message}`);
    }
  }
};
