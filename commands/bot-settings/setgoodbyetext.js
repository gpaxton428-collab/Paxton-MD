import { setGroupSetting } from '../../lib/settingsStore.js';
import { isSenderAdmin } from '../../lib/groupHelper.js';

export default {
  name: 'setgoodbyetext',
  description: 'Set a custom goodbye message for this group (admin only). Use {user} and {group} as placeholders.',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    if (!chatId.endsWith('@g.us')) return sock.sendMessage(chatId, { text: '❌ This command only works in groups.' }, { quoted: msg });
    const sender = msg.key.participant || msg.key.remoteJid;
    if (!(await isSenderAdmin(sock, chatId, sender))) return sock.sendMessage(chatId, { text: '❌ Only group admins can use this command.' }, { quoted: msg });
    const text = args.join(' ').trim();
    if (!text) return sock.sendMessage(chatId, { text: '❌ Usage: .setgoodbyetext Goodbye {user}, we will miss you!' }, { quoted: msg });
    setGroupSetting(chatId, 'goodbyeText', text);
    await sock.sendMessage(chatId, { text: '✅ Goodbye message updated.' }, { quoted: msg });
  }
};
