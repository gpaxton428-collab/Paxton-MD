import { setGlobalSetting, getGlobalSettings } from '../../lib/settingsStore.js';

export default {
  name: 'setpresence',
  ownerOnly: true,
  description: 'Set the bot\'s default WhatsApp presence (owner only). Usage: .setpresence available|unavailable',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const choice = (args[0] || '').toLowerCase();
    if (!['available', 'unavailable'].includes(choice)) {
      const settings = getGlobalSettings();
      return sock.sendMessage(chatId, { text: `ℹ️ Default presence is currently *${settings.defaultPresence || 'available'}*.\nUsage: .setpresence available|unavailable` }, { quoted: msg });
    }
    setGlobalSetting('defaultPresence', choice);
    try { await sock.sendPresenceUpdate(choice); } catch {}
    await sock.sendMessage(chatId, { text: `✅ Default presence set to *${choice}*.` }, { quoted: msg });
  }
};
