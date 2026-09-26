import { config } from '../../config/index.js';

export default {
  name: 'reloadconfig',
  ownerOnly: true,
  description: 'Re-read settings from disk and show the active configuration (owner only). Usage: .reloadconfig',
  async execute(sock, msg, args, prefix, ctx) {
    const s = ctx.getGlobalSettings(); // reads data/settings.json fresh on every call
    const text = `✅ *Config reloaded*\n\n` +
      `🎨 Menu style: ${s.menuStyle || 1}\n📢 Menu ads: ${s.menuAdsEnabled === false ? 'off' : 'on'}\n` +
      `🟢 Always online: ${s.alwaysOnline ? 'ON' : 'OFF'}\n📵 Anti-call: ${s.anticall ? 'ON' : 'OFF'}\n📝 Auto-bio: ${s.autobio ? 'ON' : 'OFF'}\n` +
      `🌐 Platform: ${config.platform}\n\n_Environment variables (.env) only change after a restart._`;
    await sock.sendMessage(msg.key.remoteJid, { text }, { quoted: msg });
  }
};
