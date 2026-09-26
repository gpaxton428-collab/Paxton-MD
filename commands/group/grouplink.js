import { safeErrorMessage } from '../../lib/utils/errors.js';
import { isSenderAdmin, replyText } from '../../lib/groupHelper.js';

export default {
  name: 'grouplink',
  alias: ['invitelink'],
  description: 'Get the group invite link, name, and total members (admin only).',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    if (!chatId.endsWith('@g.us')) return replyText(sock, msg, '❌ This command only works in groups.');
    const sender = msg.key.participant || msg.key.remoteJid;
    if (!(await isSenderAdmin(sock, chatId, sender))) return replyText(sock, msg, '❌ Only group admins can use this command.');
    try {
      const [code, metadata] = await Promise.all([
        sock.groupInviteCode(chatId),
        sock.groupMetadata(chatId)
      ]);
      const text = `🔗 *Group Link*\n\n` +
        `📛 Name: ${metadata.subject}\n` +
        `👥 Members: ${metadata.participants.length}\n` +
        `🔗 Link: https://chat.whatsapp.com/${code}`;
      await replyText(sock, msg, text);
    } catch (error) {
      await replyText(sock, msg, `❌ Failed to get invite link: ${safeErrorMessage(error)}`);
    }
  }
};
