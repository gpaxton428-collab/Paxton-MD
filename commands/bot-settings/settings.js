import { getGlobalSettings } from '../../lib/settingsStore.js';

export default {
  name: 'settings',
  alias: ['botsettings'],
  ownerOnly: true,
  description: 'Show all current bot settings, grouped by section (owner only).',
  async execute(sock, msg, args, prefix, ctx) {
    const s = getGlobalSettings();
    const on = (v) => (v ? '🟢 ON' : '🔴 OFF');

    const text = [
      '⚙️ *BOT SETTINGS*',
      `🤖 Name: ${ctx.BOT_NAME}`,
      `💬 Prefix: ${ctx.getCurrentPrefix() || 'none (prefixless)'}`,
      `🌐 Language: ${s.language}`,
      `🕐 Timezone: ${s.timezone}`,
      `🎨 Menu style: ${s.menuStyle || 1}`,
      '',
      '🛡️ *ANTI*',
      `📵 Anti-call: ${on(s.anticall)}`,
      `👻 Anti view-once: ${on(s.antivv)}`,
      `🗑️ Anti-delete: ${on(s.antidelete)}`,
      '',
      '✨ *FEATURES*',
      `🟢 Always online: ${on(s.alwaysOnline)}`,
      `📖 Auto-read: ${on(s.autoRead)}`,
      `⌨️ Auto-typing: ${on(s.autoTyping)}`,
      `🎙️ Auto-recording: ${on(s.autoRecording)}`,
      `📝 Auto-bio: ${on(s.autobio)}`,
      `👀 Auto view-status: ${on(s.autoViewStatus)}`,
      `🖼️ Welcome image: ${on(s.welcomeImage)}`
    ].join('\n');

    await sock.sendMessage(msg.key.remoteJid, { text }, { quoted: msg });
  }
};
