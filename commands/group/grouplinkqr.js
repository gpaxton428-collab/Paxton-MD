import { isSenderAdmin, replyText } from '../../lib/groupHelper.js';

export default {
  name: 'grouplinkqr',
  description: "Get a QR code for the group's invite link. Usage: .grouplinkqr",
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    if (!chatId.endsWith('@g.us')) return replyText(sock, msg, '❌ This command only works in groups.');
    const sender = msg.key.participant || msg.key.remoteJid;
    if (!(await isSenderAdmin(sock, chatId, sender))) return replyText(sock, msg, '❌ Only group admins can use this command.');
    try {
      const code = await sock.groupInviteCode(chatId);
      const inviteLink = `https://chat.whatsapp.com/${code}`;
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(inviteLink)}`;
      await sock.sendMessage(chatId, { image: { url: qrUrl }, caption: `🔗 ${inviteLink}` }, { quoted: msg });
    } catch (error) {
      await replyText(sock, msg, `❌ Failed to get invite link: ${error.message}`);
    }
  }
};
