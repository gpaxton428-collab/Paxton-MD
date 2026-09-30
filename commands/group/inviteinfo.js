import { replyText } from '../../lib/groupHelper.js';

export default {
  name: 'inviteinfo',
  description: 'Preview a WhatsApp group invite link without joining it. Usage: .inviteinfo <link>',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const link = args[0];
    if (!link || !link.includes('chat.whatsapp.com')) return replyText(sock, msg, '❌ Usage: .inviteinfo <group invite link>');
    const code = link.split('/').pop();
    try {
      const info = await sock.groupGetInviteInfo(code);
      const text = `🔗 *INVITE PREVIEW*\n\n📛 Name: ${info.subject}\n👤 Members: ${info.size ?? info.participants?.length ?? 'Unknown'}\n📝 Description: ${info.desc || 'None'}`;
      await replyText(sock, msg, text);
    } catch (error) {
      await replyText(sock, msg, `❌ Failed to preview invite: ${error.message}`);
    }
  }
};
