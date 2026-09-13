import fs from 'fs';
import path from 'path';

const SETTINGS_FILE = path.join(process.cwd(), 'data', 'settings.json');

export default {
  name: 'factoryreset',
  ownerOnly: true,
  description: '⚠️ DANGEROUS: wipes all global bot settings back to defaults (owner only). Group-specific settings are untouched. Usage: .factoryreset confirm',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    if ((args[0] || '').toLowerCase() !== 'confirm') {
      return sock.sendMessage(chatId, { text: '⚠️ This resets ALL global bot settings (menu style, toggles, prefix behavior, etc) back to defaults.\nType `.factoryreset confirm` if you\'re sure.' }, { quoted: msg });
    }
    try {
      if (fs.existsSync(SETTINGS_FILE)) fs.unlinkSync(SETTINGS_FILE);
      await sock.sendMessage(chatId, { text: '✅ Global settings wiped back to factory defaults.' }, { quoted: msg });
    } catch (error) {
      await sock.sendMessage(chatId, { text: `❌ Failed: ${error.message}` }, { quoted: msg });
    }
  }
};
