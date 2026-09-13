import fs from 'fs';
import path from 'path';

export default {
  name: 'clearallwarnings',
  ownerOnly: true,
  description: 'Clear every warning and anti-* strike across all groups (owner only, use with care).',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    try {
      const file = path.join(process.cwd(), 'data', 'group_settings.json');
      if (fs.existsSync(file)) {
        const all = JSON.parse(fs.readFileSync(file, 'utf8'));
        for (const jid of Object.keys(all)) {
          all[jid].warnings = {};
          all[jid].actionWarnings = {};
        }
        fs.writeFileSync(file, JSON.stringify(all, null, 2));
      }
      await sock.sendMessage(chatId, { text: '✅ All warnings cleared across every group.' }, { quoted: msg });
    } catch (error) {
      await sock.sendMessage(chatId, { text: `❌ Failed: ${error.message}` }, { quoted: msg });
    }
  }
};
