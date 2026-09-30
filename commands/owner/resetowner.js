import fs from 'fs';

const OWNER_FILE = './owner.json';

export default {
  name: 'resetowner',
  ownerOnly: true,
  description: 'Clear the stored owner so the bot can be re-linked (owner only, use with care).',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    try {
      if (fs.existsSync(OWNER_FILE)) fs.rmSync(OWNER_FILE);
      await sock.sendMessage(chatId, { text: '✅ Owner data cleared. The next person to link the bot becomes the new owner.' }, { quoted: msg });
    } catch (error) {
      await sock.sendMessage(chatId, { text: `❌ Failed: ${error.message}` }, { quoted: msg });
    }
  }
};
