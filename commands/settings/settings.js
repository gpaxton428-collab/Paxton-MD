import { getGlobalSettings } from '../../lib/settingsStore.js';

export default {
  name: 'settings',
  alias: ['botsettings'],
  ownerOnly: true,
  description: 'Show all current bot settings (owner only).',
  async execute(sock, msg, args, prefix, ctx) {
    const s = getGlobalSettings();
    const text = `⚙️ *BOT SETTINGS*\n\n` +
      `🤖 Name: ${ctx.BOT_NAME}\n` +
      `💬 Prefix: ${ctx.getCurrentPrefix() || 'none (prefixless)'}\n` +
      `🟢 Always online: ${s.alwaysOnline ? 'ON' : 'OFF'}\n` +
      `📖 Auto-read: ${s.autoRead ? 'ON' : 'OFF'}\n` +
      `⌨️ Auto-typing: ${s.autoTyping ? 'ON' : 'OFF'}\n` +
      `🎙️ Auto-recording: ${s.autoRecording ? 'ON' : 'OFF'}\n` +
      `🗑️ Anti-delete: ${s.antidelete ? 'ON' : 'OFF'}\n` +
      `📝 Auto-bio: ${s.autobio ? 'ON' : 'OFF'}\n` +
      `🌐 Language: ${s.language}\n` +
      `🕐 Timezone: ${s.timezone}`;
    await sock.sendMessage(msg.key.remoteJid, { text }, { quoted: msg });
  }
};
