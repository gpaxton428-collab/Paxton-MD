import { isSenderAdmin, replyText } from '../../lib/groupHelper.js';
import { getGroupSettings, addBadWord, removeBadWord } from '../../lib/settingsStore.js';

export default {
  name: 'badword',
  description: 'Manage the banned word list used by anti-badword (admin only). Usage: .badword add|remove|list <word>',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    if (!chatId.endsWith('@g.us')) return replyText(sock, msg, '❌ This command only works in groups.');
    const sender = msg.key.participant || msg.key.remoteJid;
    if (!(await isSenderAdmin(sock, chatId, sender))) return replyText(sock, msg, '❌ Only group admins can use this command.');
    const action = (args[0] || '').toLowerCase();
    const word = args.slice(1).join(' ').trim();
    if (action === 'list') {
      const settings = getGroupSettings(chatId);
      if (settings.badwords.length === 0) return replyText(sock, msg, 'ℹ️ No banned words set yet.');
      return replyText(sock, msg, `🚫 *BANNED WORDS*\n\n${settings.badwords.join(', ')}`);
    }
    if (!word) return replyText(sock, msg, '❌ Usage: .badword add|remove|list <word>');
    if (action === 'add') {
      addBadWord(chatId, word);
      return replyText(sock, msg, `✅ Added "${word}" to the banned word list.`);
    }
    if (action === 'remove') {
      removeBadWord(chatId, word);
      return replyText(sock, msg, `✅ Removed "${word}" from the banned word list.`);
    }
    await replyText(sock, msg, '❌ Usage: .badword add|remove|list <word>');
  }
};
