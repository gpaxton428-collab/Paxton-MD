import fs from 'fs';
import path from 'path';

export default {
  name: 'resetsettings',
  ownerOnly: true,
  description: 'Reset all global bot settings back to defaults (owner only).',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    const file = path.join(process.cwd(), 'data', 'settings.json');
    try {
      if (fs.existsSync(file)) fs.rmSync(file);
      await sock.sendMessage(chatId, { text: '✅ Bot settings reset to defaults.' }, { quoted: msg });
    } catch (error) {
      await sock.sendMessage(chatId, { text: `❌ Failed: ${error.message}` }, { quoted: msg });
    }
  }
};
