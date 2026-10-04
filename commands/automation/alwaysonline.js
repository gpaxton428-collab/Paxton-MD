import { getGlobalSettings, setGlobalSetting } from '../../lib/settingsStore.js';

export default {
  name: 'alwaysonline',
  alias: ['online'],
  ownerOnly: true,
  description: "Keep the bot's presence set to online at all times (owner only). Usage: .alwaysonline on|off",
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const choice = (args[0] || '').toLowerCase();
    if (choice !== 'on' && choice !== 'off') {
      const settings = getGlobalSettings();
      return sock.sendMessage(chatId, { text: `ℹ️ Always online is currently *${settings.alwaysOnline ? 'ON' : 'OFF'}*.\nUsage: .alwaysonline on|off` }, { quoted: msg });
    }
    setGlobalSetting('alwaysOnline', choice === 'on');
    await sock.sendMessage(chatId, { text: `✅ Always online turned *${choice.toUpperCase()}*.` }, { quoted: msg });
  }
};
