import { getTargetJid } from '../../lib/groupHelper.js';
import { getGlobalSettings, setGlobalSetting } from '../../lib/settingsStore.js';

export default {
  name: 'unblacklist',
  ownerOnly: true,
  description: 'Remove a user from the global blacklist (owner only). Usage: reply to/mention them with .unblacklist',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const target = getTargetJid(msg, args);
    if (!target) return sock.sendMessage(chatId, { text: '❌ Reply to or mention the user to unblacklist.' }, { quoted: msg });
    const settings = getGlobalSettings();
    const list = (settings.globalBlacklist || []).filter((j) => j !== target);
    setGlobalSetting('globalBlacklist', list);
    await sock.sendMessage(chatId, { text: `✅ Removed @${target.split('@')[0]} from the blacklist.`, mentions: [target] }, { quoted: msg });
  }
};
