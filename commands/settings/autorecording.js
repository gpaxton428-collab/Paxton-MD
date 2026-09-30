import { getGlobalSettings, setGlobalSetting } from '../../lib/settingsStore.js';

export default {
  name: 'autorecording',
  
  ownerOnly: true,
  description: 'Show a recording-audio indicator before the bot replies (owner only). Usage: .autorecording on|off',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const choice = (args[0] || '').toLowerCase();
    if (choice !== 'on' && choice !== 'off') {
      const settings = getGlobalSettings();
      return sock.sendMessage(chatId, { text: `ℹ️ Auto-recording is currently *${settings.autoRecording ? 'ON' : 'OFF'}*.\nUsage: .autorecording on|off` }, { quoted: msg });
    }
    setGlobalSetting('autoRecording', choice === 'on');
    await sock.sendMessage(chatId, { text: `✅ Auto-recording turned *${choice.toUpperCase()}*.` }, { quoted: msg });
  }
};
