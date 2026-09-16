import fs from 'fs';
import path from 'path';

export default {
  name: 'checksettings',
  ownerOnly: true,
  description: 'Validate every JSON settings/state file for corruption (owner only, $-prefix). Usage: $checksettings',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    const files = [
      'data/settings.json', 'data/group_settings.json',
      'bot_mode.json', 'prefix_config.json', 'bot_settings.json', 'owner.json'
    ];
    const results = [];
    for (const rel of files) {
      const full = path.join(process.cwd(), rel);
      if (!fs.existsSync(full)) { results.push(`⚪ ${rel} — not created yet`); continue; }
      try {
        const raw = fs.readFileSync(full, 'utf8');
        if (raw.trim()) JSON.parse(raw);
        results.push(`✅ ${rel} — OK`);
      } catch (e) {
        results.push(`❌ ${rel} — CORRUPTED: ${e.message}`);
      }
    }
    await sock.sendMessage(chatId, { text: `🩺 *Settings File Check*\n\n${results.join('\n')}` }, { quoted: msg });
  }
};
