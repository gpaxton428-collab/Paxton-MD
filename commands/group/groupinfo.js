import { getGroupMetadata, replyText } from '../../lib/groupHelper.js';

export default {
  name: 'groupinfo',
  alias: ['ginfo'],
  description: 'Show information about the current group.',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    if (!chatId.endsWith('@g.us')) return replyText(sock, msg, '❌ This command only works in groups.');
    const metadata = await getGroupMetadata(sock, chatId);
    if (!metadata) return replyText(sock, msg, '❌ Could not fetch group info.');
    const admins = metadata.participants.filter((p) => p.admin).length;
    const created = metadata.creation ? new Date(metadata.creation * 1000).toLocaleDateString() : 'Unknown';
    const text = `👥 *GROUP INFO*\n\n📛 Name: ${metadata.subject}\n🆔 ID: ${metadata.id}\n👤 Members: ${metadata.participants.length}\n👑 Admins: ${admins}\n📅 Created: ${created}\n📝 Description: ${metadata.desc || 'None'}`;
    await replyText(sock, msg, text);
  }
};
