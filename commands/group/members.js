import { getGroupMetadata, replyText } from '../../lib/groupHelper.js';

export default {
  name: 'members',
  alias: ['groupmembers', 'listmembers'],
  description: 'List every member of the group.',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    if (!chatId.endsWith('@g.us')) return replyText(sock, msg, '❌ This command only works in groups.');
    const metadata = await getGroupMetadata(sock, chatId);
    if (!metadata) return replyText(sock, msg, '❌ Could not fetch group members.');
    const mentions = metadata.participants.map((p) => p.id);
    const lines = metadata.participants.map((p) => {
      const tag = p.admin === 'superadmin' ? ' (owner)' : p.admin === 'admin' ? ' (admin)' : '';
      return `• @${p.id.split('@')[0]}${tag}`;
    });
    await sock.sendMessage(chatId, { text: `👥 *MEMBERS (${metadata.participants.length})*\n\n${lines.join('\n')}`, mentions }, { quoted: msg });
  }
};
