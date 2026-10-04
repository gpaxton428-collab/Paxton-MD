import { getGroupMetadata, replyText } from '../../lib/groupHelper.js';

export default {
  name: 'hidetag',
  description: 'Send a message that silently mentions every member (admin only).',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    if (!chatId.endsWith('@g.us')) return replyText(sock, msg, '❌ This command only works in groups.');
    const metadata = await getGroupMetadata(sock, chatId);
    if (!metadata) return replyText(sock, msg, '❌ Could not fetch group members.');
    const text = args.join(' ') || '📢 Attention everyone';
    const mentions = metadata.participants.map((p) => p.id);
    await sock.sendMessage(chatId, { text, mentions }, { quoted: msg });
  }
};
