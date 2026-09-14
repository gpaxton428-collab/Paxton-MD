import { setGroupSetting } from '../../lib/settingsStore.js';
import { isSenderAdmin } from '../../lib/groupHelper.js';

export default {
  name: 'setwelcometext',
  description: 'Set a custom welcome message for this group (admin only). Use {user} and {group} as placeholders.',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    if (!chatId.endsWith('@g.us')) return sock.sendMessage(chatId, { text: '❌ This command only works in groups.' }, { quoted: msg });
    const sender = msg.key.participant || msg.key.remoteJid;
    if (!(await isSenderAdmin(sock, chatId, sender))) return sock.sendMessage(chatId, { text: '❌ Only group admins can use this command.' }, { quoted: msg });
    const text = args.join(' ').trim();
    if (!text) return sock.sendMessage(chatId, { text: '❌ Usage: .setwelcometext Welcome {user} to {group}!' }, { quoted: msg });
    setGroupSetting(chatId, 'welcomeText', text);
    await sock.sendMessage(chatId, { text: '✅ Welcome message updated.' }, { quoted: msg });
  }
};
