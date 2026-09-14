import { getGlobalSettings, setGlobalSetting } from '../../lib/settingsStore.js';

export default {
  name: 'anticall',
  ownerOnly: true,
  description: 'Automatically reject incoming calls to the bot (owner only). Usage: .anticall on|off',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const choice = (args[0] || '').toLowerCase();
    if (choice !== 'on' && choice !== 'off') {
      const settings = getGlobalSettings();
      return sock.sendMessage(chatId, { text: `ℹ️ Anti-call is currently *${settings.anticall ? 'ON' : 'OFF'}*.\nUsage: .anticall on|off` }, { quoted: msg });
    }
    setGlobalSetting('anticall', choice === 'on');
    await sock.sendMessage(chatId, { text: `✅ Anti-call turned *${choice.toUpperCase()}*.` }, { quoted: msg });
  }
};
