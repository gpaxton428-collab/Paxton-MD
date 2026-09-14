import fs from 'fs';

const WHITELIST_FILE = './whitelist.json';

export default {
  name: 'listwhitelist',
  alias: ['sudolist'],
  ownerOnly: true,
  description: 'List all whitelisted users (owner only).',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    let data = { whitelist: [] };
    try { if (fs.existsSync(WHITELIST_FILE)) data = JSON.parse(fs.readFileSync(WHITELIST_FILE, 'utf8')); } catch {}
    const list = data.whitelist || [];
    if (list.length === 0) return sock.sendMessage(chatId, { text: 'ℹ️ No whitelisted users.' }, { quoted: msg });
    const lines = list.map((j) => `• @${j.split('@')[0]}`);
    await sock.sendMessage(chatId, { text: `📋 *WHITELIST*\n\n${lines.join('\n')}`, mentions: list }, { quoted: msg });
  }
};
