import { getGroupMetadata, replyText } from '../../lib/groupHelper.js';

export default {
  name: 'inactivelist',
  description: 'List group members who are not admins (a starting point for manually reviewing inactivity). Usage: .inactivelist',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    if (!chatId.endsWith('@g.us')) return replyText(sock, msg, '❌ This command only works in groups.');
    const metadata = await getGroupMetadata(sock, chatId);
    if (!metadata) return replyText(sock, msg, '❌ Could not load group info.');
    const nonAdmins = metadata.participants.filter((p) => p.admin !== 'admin' && p.admin !== 'superadmin');
    const preview = nonAdmins.slice(0, 30).map((p) => `@${p.id.split('@')[0]}`).join(', ');
    await sock.sendMessage(chatId, { text: `👥 *Non-admin members* (${nonAdmins.length} total, showing up to 30):\n${preview}`, mentions: nonAdmins.slice(0, 30).map((p) => p.id) }, { quoted: msg });
  }
};
