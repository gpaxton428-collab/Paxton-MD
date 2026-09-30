import { getGlobalSettings, setGlobalSetting } from '../../lib/settingsStore.js';

export default {
  name: 'autobio',
  
  ownerOnly: true,
  description: "Periodically update the bot's WhatsApp About/bio text (owner only). Usage: .autobio on|off",
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const choice = (args[0] || '').toLowerCase();
    if (choice !== 'on' && choice !== 'off') {
      const settings = getGlobalSettings();
      return sock.sendMessage(chatId, { text: `ℹ️ Auto-bio is currently *${settings.autobio ? 'ON' : 'OFF'}*.\nUsage: .autobio on|off` }, { quoted: msg });
    }
    setGlobalSetting('autobio', choice === 'on');
    await sock.sendMessage(chatId, { text: `✅ Auto-bio turned *${choice.toUpperCase()}*.` }, { quoted: msg });
  }
};
