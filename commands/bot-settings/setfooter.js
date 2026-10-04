import { getGlobalSettings, setGlobalSetting } from '../../lib/settingsStore.js';

export default {
  name: 'setfooter',
  ownerOnly: true,
  description: "Change the footer line shown at the bottom of .menu (owner only). Usage: .setfooter <text>",
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const text = args.join(' ').trim();
    if (!text) {
      const settings = getGlobalSettings();
      return sock.sendMessage(chatId, { text: `ℹ️ Current menu footer: *${settings.menuFooter}*\nUsage: .setfooter <text>` }, { quoted: msg });
    }
    setGlobalSetting('menuFooter', text);
    await sock.sendMessage(chatId, { text: `✅ Menu footer set to: *${text}*` }, { quoted: msg });
  }
};
