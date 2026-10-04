import fs from 'fs';
import path from 'path';

export default {
  name: 'fixsettings',
  ownerOnly: true,
  strictOwner: true,
  description: 'Reset any corrupted JSON settings file back to a safe empty state (owner only; a .bak copy is kept). Usage: .fixsettings',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    const files = [
      'data/settings.json', 'data/group_settings.json',
      'bot_mode.json', 'prefix_config.json', 'bot_settings.json', 'owner.json'
    ];
    const fixed = [];
    for (const rel of files) {
      const full = path.join(process.cwd(), rel);
      if (!fs.existsSync(full)) continue;
      try {
        const raw = fs.readFileSync(full, 'utf8');
        if (raw.trim()) JSON.parse(raw);
      } catch {
        try { fs.copyFileSync(full, `${full}.bak`); } catch { /* best effort */ }
        fs.writeFileSync(full, '{}');
        fixed.push(rel);
      }
    }
    const text = fixed.length
      ? `🔧 Reset ${fixed.length} corrupted file(s):\n${fixed.join('\n')}`
      : '✅ Nothing was corrupted — all settings files are valid.';
    await sock.sendMessage(chatId, { text }, { quoted: msg });
  }
};
