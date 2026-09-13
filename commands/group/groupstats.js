import { getGroupMetadata, replyText } from '../../lib/groupHelper.js';

export default {
  name: 'groupstats',
  description: 'Show a breakdown of members vs admins in the group. Usage: .groupstats',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    if (!chatId.endsWith('@g.us')) return replyText(sock, msg, '❌ This command only works in groups.');
    const metadata = await getGroupMetadata(sock, chatId);
    if (!metadata) return replyText(sock, msg, '❌ Could not load group info.');
    const total = metadata.participants.length;
    const admins = metadata.participants.filter((p) => p.admin === 'admin' || p.admin === 'superadmin').length;
    await replyText(sock, msg, `📊 *Group Stats*\n👥 Members: ${total}\n👑 Admins: ${admins}\n🙋 Regular: ${total - admins}`);
  }
};
