import { getGroupMetadata, replyText } from '../../lib/groupHelper.js';

export default {
  name: 'listadmins',
  alias: ['admins'],
  description: 'List the current group admins.',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    if (!chatId.endsWith('@g.us')) return replyText(sock, msg, '❌ This command only works in groups.');
    const metadata = await getGroupMetadata(sock, chatId);
    if (!metadata) return replyText(sock, msg, '❌ Could not fetch group info.');
    const admins = metadata.participants.filter((p) => p.admin);
    if (admins.length === 0) return replyText(sock, msg, 'No admins found.');
    const mentions = admins.map((a) => a.id);
    const lines = admins.map((a) => `👑 @${a.id.split('@')[0]}${a.admin === 'superadmin' ? ' (owner)' : ''}`);
    await sock.sendMessage(chatId, { text: `*GROUP ADMINS*\n\n${lines.join('\n')}`, mentions }, { quoted: msg });
  }
};
