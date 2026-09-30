import fs from 'fs';

const BLOCKED_FILE = './blocked_users.json';

export default {
  name: 'blocklist',
  ownerOnly: true,
  description: 'Show all users blocked from using the bot (owner only).',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    let list = [];
    try { if (fs.existsSync(BLOCKED_FILE)) list = JSON.parse(fs.readFileSync(BLOCKED_FILE, 'utf8')); } catch {}
    if (list.length === 0) return sock.sendMessage(chatId, { text: 'ℹ️ No users are blocked.' }, { quoted: msg });
    const lines = list.map((j) => `• @${j.split('@')[0]}`);
    await sock.sendMessage(chatId, { text: `🚫 *BLOCKED USERS*\n\n${lines.join('\n')}`, mentions: list }, { quoted: msg });
  }
};
