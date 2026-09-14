import { replyText } from '../../lib/groupHelper.js';
import { getGroupSettings } from '../../lib/settingsStore.js';

export default {
  name: 'rules',
  description: 'Show the group rules.',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    if (!chatId.endsWith('@g.us')) return replyText(sock, msg, '❌ This command only works in groups.');
    const settings = getGroupSettings(chatId);
    await replyText(sock, msg, settings.rules ? `📜 *GROUP RULES*\n\n${settings.rules}` : 'ℹ️ No rules have been set yet. An admin can set them with .setrules');
  }
};
