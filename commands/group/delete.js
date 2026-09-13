import { isSenderAdmin, isBotAdmin, replyText } from '../../lib/groupHelper.js';

export default {
  name: 'delete',
  alias: ['del'],
  description: 'Delete a message for everyone. Reply to the message with this command (admin only).',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    if (!chatId.endsWith('@g.us')) return replyText(sock, msg, '❌ This command only works in groups.');
    const sender = msg.key.participant || msg.key.remoteJid;
    if (!(await isSenderAdmin(sock, chatId, sender))) return replyText(sock, msg, '❌ Only group admins can use this command.');
    if (!(await isBotAdmin(sock, chatId))) return replyText(sock, msg, '❌ I need to be an admin to do that.');
    const contextInfo = msg.message?.extendedTextMessage?.contextInfo;
    if (!contextInfo?.stanzaId) return replyText(sock, msg, '❌ Reply to the message you want to delete.');
    try {
      await sock.sendMessage(chatId, {
        delete: {
          remoteJid: chatId,
          fromMe: false,
          id: contextInfo.stanzaId,
          participant: contextInfo.participant
        }
      });
    } catch (error) {
      await replyText(sock, msg, `❌ Failed to delete: ${error.message}`);
    }
  }
};
