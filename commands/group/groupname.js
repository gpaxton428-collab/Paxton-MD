import { isSenderAdmin, isBotAdmin, replyText } from '../../lib/groupHelper.js';

export default {
  name: 'groupname',
  alias: ['setgroupname'],
  description: 'Change the group subject/name (admin only). Usage: .groupname New Name',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    if (!chatId.endsWith('@g.us')) return replyText(sock, msg, '❌ This command only works in groups.');
    const sender = msg.key.participant || msg.key.remoteJid;
    if (!(await isSenderAdmin(sock, chatId, sender))) return replyText(sock, msg, '❌ Only group admins can use this command.');
    if (!(await isBotAdmin(sock, chatId))) return replyText(sock, msg, '❌ I need to be an admin to do that.');
    const newName = args.join(' ').trim();
    if (!newName) return replyText(sock, msg, '❌ Usage: .groupname <new name>');
    try {
      await sock.groupUpdateSubject(chatId, newName);
      await replyText(sock, msg, `✅ Group name changed to: ${newName}`);
    } catch (error) {
      await replyText(sock, msg, `❌ Failed to change name: ${error.message}`);
    }
  }
};
