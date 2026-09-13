import { getGroupMetadata, isSenderAdmin, replyText } from '../../lib/groupHelper.js';

export default {
  name: 'adminmention',
  alias: ['tagadmins'],
  description: 'Silently tag only the group admins. Usage: .adminmention <message>',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    if (!chatId.endsWith('@g.us')) return replyText(sock, msg, '❌ This command only works in groups.');
    const sender = msg.key.participant || msg.key.remoteJid;
    if (!(await isSenderAdmin(sock, chatId, sender))) return replyText(sock, msg, '❌ Only group admins can use this command.');
    const metadata = await getGroupMetadata(sock, chatId);
    if (!metadata) return replyText(sock, msg, '❌ Could not load group info.');
    const admins = metadata.participants.filter((p) => p.admin === 'admin' || p.admin === 'superadmin').map((p) => p.id);
    const text = args.join(' ') || 'Attention admins';
    await sock.sendMessage(chatId, { text, mentions: admins }, { quoted: msg });
  }
};
