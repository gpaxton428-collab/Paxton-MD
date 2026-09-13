import { setGlobalSetting } from '../../lib/settingsStore.js';

export default {
  name: 'setlanguage',
  alias: ['setlang'],
  ownerOnly: true,
  description: 'Set the bot response language code (owner only). Usage: .setlanguage en',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const lang = (args[0] || '').toLowerCase();
    if (!lang) return sock.sendMessage(chatId, { text: '❌ Usage: .setlanguage <code> (e.g. en, fr, pt)' }, { quoted: msg });
    setGlobalSetting('language', lang);
    await sock.sendMessage(chatId, { text: `✅ Language set to *${lang}*.` }, { quoted: msg });
  }
};
