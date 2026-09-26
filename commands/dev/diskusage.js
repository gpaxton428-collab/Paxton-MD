import fs from 'fs';
import path from 'path';

function dirSize(dir) {
  let total = 0;
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return 0; }
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    const full = path.join(dir, entry.name);
    try {
      if (entry.isDirectory()) total += dirSize(full);
      else total += fs.statSync(full).size;
    } catch {}
  }
  return total;
}

export default {
  name: 'diskusage',
  alias: ['du'],
  ownerOnly: true,
  description: 'Show project folder size on disk, excluding node_modules (owner only). Usage: .diskusage',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    const bytes = dirSize(process.cwd());
    const mb = (bytes / 1024 / 1024).toFixed(2);
    await sock.sendMessage(chatId, { text: `💽 *Disk Usage*

Project size (excl. node_modules): ${mb} MB` }, { quoted: msg });
  }
};
