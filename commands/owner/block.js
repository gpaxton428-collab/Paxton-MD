import fs from 'fs';
import { getTargetJid } from '../../lib/groupHelper.js';

const BLOCKED_FILE = './blocked_users.json';

export default {
  name: 'block',
  ownerOnly: true,
  description: 'Block a user from using the bot (owner only). Reply to or mention them.',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const target = getTargetJid(msg, args);
    if (!target) return sock.sendMessage(chatId, { text: '❌ Reply to or mention the user to block.' }, { quoted: msg });
    let list = [];
    try { if (fs.existsSync(BLOCKED_FILE)) list = JSON.parse(fs.readFileSync(BLOCKED_FILE, 'utf8')); } catch {}
    if (!list.includes(target)) list.push(target);
    fs.writeFileSync(BLOCKED_FILE, JSON.stringify(list, null, 2));
    try { await sock.updateBlockStatus(target, 'block'); } catch {}
    await sock.sendMessage(chatId, { text: `✅ Blocked @${target.split('@')[0]}.`, mentions: [target] }, { quoted: msg });
  }
};
