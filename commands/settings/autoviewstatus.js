import { getGlobalSettings, setGlobalSetting } from '../../lib/settingsStore.js';

export default {
  name: 'autoviewstatus',
  alias: ['autostatus'],
  ownerOnly: true,
  description: 'Automatically view (mark as read) everyone\'s WhatsApp status updates (owner only). Usage: .autoviewstatus on|off',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const choice = (args[0] || '').toLowerCase();
    if (choice !== 'on' && choice !== 'off') {
      const settings = getGlobalSettings();
      return sock.sendMessage(chatId, { text: `ℹ️ Auto-view-status is currently *${settings.autoViewStatus ? 'ON' : 'OFF'}*.\nUsage: .autoviewstatus on|off` }, { quoted: msg });
    }
    setGlobalSetting('autoViewStatus', choice === 'on');
    await sock.sendMessage(chatId, { text: `✅ Auto-view-status turned *${choice.toUpperCase()}*.` }, { quoted: msg });
  }
};
