import { replyText } from '../../lib/groupHelper.js';

export default {
  name: 'groupid',
  description: 'Show the raw JID of the current group.',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    if (!chatId.endsWith('@g.us')) return replyText(sock, msg, '❌ This command only works in groups.');
    await replyText(sock, msg, `🆔 Group ID: ${chatId}`);
  }
};
