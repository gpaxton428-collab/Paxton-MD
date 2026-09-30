import { getGlobalSettings, setGlobalSetting } from '../../lib/settingsStore.js';

export default {
  name: 'autoread',
  
  ownerOnly: true,
  description: 'Automatically mark incoming messages as read (owner only). Usage: .autoread on|off',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const choice = (args[0] || '').toLowerCase();
    if (choice !== 'on' && choice !== 'off') {
      const settings = getGlobalSettings();
      return sock.sendMessage(chatId, { text: `ℹ️ Auto-read is currently *${settings.autoRead ? 'ON' : 'OFF'}*.\nUsage: .autoread on|off` }, { quoted: msg });
    }
    setGlobalSetting('autoRead', choice === 'on');
    await sock.sendMessage(chatId, { text: `✅ Auto-read turned *${choice.toUpperCase()}*.` }, { quoted: msg });
  }
};
