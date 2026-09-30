import { getGlobalSettings } from '../../lib/settingsStore.js';

export default {
  name: 'settings',
  alias: ['botsettings'],
  ownerOnly: true,
  description: 'Show current bot settings (owner only).',
  async execute(sock, msg, args, prefix, ctx) {
    const s = getGlobalSettings();
    const text = `⚙️ *BOT SETTINGS*\n\n` +
      `🤖 Name: ${ctx.BOT_NAME}\n` +
      `💬 Prefix: ${ctx.getCurrentPrefix() || 'none (prefixless)'}\n` +
      `📖 Auto-read: ${s.autoRead ? 'ON' : 'OFF'}\n` +
      `⌨️ Auto-typing: ${s.autoTyping ? 'ON' : 'OFF'}\n` +
      `👁️ Anti-viewonce: ${s.antivv ? 'ON' : 'OFF'}`;
    await sock.sendMessage(msg.key.remoteJid, { text }, { quoted: msg });
  }
};
