import { isSenderAdmin, replyText } from '../../lib/groupHelper.js';
import { setGroupSetting } from '../../lib/settingsStore.js';

export default {
  name: 'setrules',
  description: 'Set the group rules text (admin only). Usage: .setrules <text>',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    if (!chatId.endsWith('@g.us')) return replyText(sock, msg, '❌ This command only works in groups.');
    const sender = msg.key.participant || msg.key.remoteJid;
    if (!(await isSenderAdmin(sock, chatId, sender))) return replyText(sock, msg, '❌ Only group admins can use this command.');
    const rules = args.join(' ').trim();
    if (!rules) return replyText(sock, msg, '❌ Usage: .setrules <text>');
    setGroupSetting(chatId, 'rules', rules);
    await replyText(sock, msg, '✅ Group rules updated.');
  }
};
