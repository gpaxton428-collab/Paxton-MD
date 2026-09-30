import { getGroupMetadata, replyText } from '../../lib/groupHelper.js';

export default {
  name: 'tagall',
  description: 'Mention every member of the group.',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    if (!chatId.endsWith('@g.us')) return replyText(sock, msg, '❌ This command only works in groups.');
    const metadata = await getGroupMetadata(sock, chatId);
    if (!metadata) return replyText(sock, msg, '❌ Could not fetch group members.');
    const note = args.join(' ');
    const mentions = metadata.participants.map((p) => p.id);
    const lines = metadata.participants.map((p) => `• @${p.id.split('@')[0]}`);
    const text = `📢 *TAG ALL*${note ? `\n${note}` : ''}\n\n${lines.join('\n')}`;
    await sock.sendMessage(chatId, { text, mentions }, { quoted: msg });
  }
};
