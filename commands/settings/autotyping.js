import { getGlobalSettings, setGlobalSetting } from '../../lib/settingsStore.js';

export default {
  name: 'autotyping',
  
  ownerOnly: true,
  description: 'Show a typing indicator before the bot replies (owner only). Usage: .autotyping on|off',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const choice = (args[0] || '').toLowerCase();
    if (choice !== 'on' && choice !== 'off') {
      const settings = getGlobalSettings();
      return sock.sendMessage(chatId, { text: `ℹ️ Auto-typing is currently *${settings.autoTyping ? 'ON' : 'OFF'}*.\nUsage: .autotyping on|off` }, { quoted: msg });
    }
    setGlobalSetting('autoTyping', choice === 'on');
    await sock.sendMessage(chatId, { text: `✅ Auto-typing turned *${choice.toUpperCase()}*.` }, { quoted: msg });
  }
};
