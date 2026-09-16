import fs from 'fs';
import path from 'path';

export default {
  name: 'cleartmp',
  ownerOnly: true,
  description: 'Delete temporary files created by the bot (owner only).',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    const tmpDir = path.join(process.cwd(), 'tmp');
    let removed = 0;
    try {
      if (fs.existsSync(tmpDir)) {
        for (const file of fs.readdirSync(tmpDir)) {
          fs.rmSync(path.join(tmpDir, file), { force: true, recursive: true });
          removed++;
        }
      }
    } catch {}
    await sock.sendMessage(chatId, { text: `🧹 Cleared ${removed} temp file(s).` }, { quoted: msg });
  }
};
