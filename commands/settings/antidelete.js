import { getGlobalSettings, setGlobalSetting } from '../../lib/settingsStore.js';

export default {
  name: 'antidelete',
  
  ownerOnly: true,
  description: 'Re-send messages that get deleted by their sender (owner only). Usage: .antidelete on|off',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const choice = (args[0] || '').toLowerCase();
    if (choice !== 'on' && choice !== 'off') {
      const settings = getGlobalSettings();
      return sock.sendMessage(chatId, { text: `ℹ️ Anti-delete is currently *${settings.antidelete ? 'ON' : 'OFF'}*.\nUsage: .antidelete on|off` }, { quoted: msg });
    }
    setGlobalSetting('antidelete', choice === 'on');
    await sock.sendMessage(chatId, { text: `✅ Anti-delete turned *${choice.toUpperCase()}*.` }, { quoted: msg });
  }
};
