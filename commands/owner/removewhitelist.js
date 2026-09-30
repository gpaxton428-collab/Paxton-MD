import fs from 'fs';
import { getTargetJid } from '../../lib/groupHelper.js';

const WHITELIST_FILE = './whitelist.json';

export default {
  name: 'removewhitelist',
  alias: ['removesudo'],
  ownerOnly: true,
  description: 'Remove a user from the whitelist (owner only).',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const target = getTargetJid(msg, args);
    if (!target) return sock.sendMessage(chatId, { text: '❌ Reply to or mention the user to remove.' }, { quoted: msg });
    let data = { whitelist: [] };
    try { if (fs.existsSync(WHITELIST_FILE)) data = JSON.parse(fs.readFileSync(WHITELIST_FILE, 'utf8')); } catch {}
    data.whitelist = (data.whitelist || []).filter((j) => j !== target);
    fs.writeFileSync(WHITELIST_FILE, JSON.stringify(data, null, 2));
    await sock.sendMessage(chatId, { text: `✅ Removed @${target.split('@')[0]} from the whitelist.`, mentions: [target] }, { quoted: msg });
  }
};
