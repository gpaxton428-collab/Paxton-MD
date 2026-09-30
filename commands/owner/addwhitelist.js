import fs from 'fs';
import { getTargetJid } from '../../lib/groupHelper.js';

const WHITELIST_FILE = './whitelist.json';

export default {
  name: 'addwhitelist',
  alias: ['addsudo'],
  ownerOnly: true,
  description: 'Give a user trusted/whitelisted access (owner only).',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const target = getTargetJid(msg, args);
    if (!target) return sock.sendMessage(chatId, { text: '❌ Reply to or mention the user to whitelist.' }, { quoted: msg });
    let data = { whitelist: [] };
    try { if (fs.existsSync(WHITELIST_FILE)) data = JSON.parse(fs.readFileSync(WHITELIST_FILE, 'utf8')); } catch {}
    if (!data.whitelist) data.whitelist = [];
    if (!data.whitelist.includes(target)) data.whitelist.push(target);
    fs.writeFileSync(WHITELIST_FILE, JSON.stringify(data, null, 2));
    await sock.sendMessage(chatId, { text: `✅ Whitelisted @${target.split('@')[0]}. Restart the bot to apply.`, mentions: [target] }, { quoted: msg });
  }
};
