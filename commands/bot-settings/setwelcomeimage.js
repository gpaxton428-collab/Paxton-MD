import { setGlobalSetting, getGlobalSettings } from '../../lib/settingsStore.js';

export default {
  name: 'setwelcomeimage'
  ,
  ownerOnly: true,
  description: "Toggle whether welcome messages include the bot's profile picture as an image (owner only). Usage: .setwelcomeimage on|off",
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const choice = (args[0] || '').toLowerCase();
    if (choice !== 'on' && choice !== 'off') {
      const settings = getGlobalSettings();
      return sock.sendMessage(chatId, { text: `ℹ️ Welcome image is currently *${settings.welcomeImage ? 'ON' : 'OFF'}*.\nUsage: .setwelcomeimage on|off` }, { quoted: msg });
    }
    setGlobalSetting('welcomeImage', choice === 'on');
    await sock.sendMessage(chatId, { text: `✅ Welcome image turned *${choice.toUpperCase()}*.` }, { quoted: msg });
  }
};
