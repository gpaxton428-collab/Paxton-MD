import fs from 'fs';
import { getTargetJid } from '../../lib/groupHelper.js';

const BLOCKED_FILE = './blocked_users.json';

export default {
  name: 'unblock',
  ownerOnly: true,
  description: 'Unblock a previously blocked user (owner only).',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const target = getTargetJid(msg, args);
    if (!target) return sock.sendMessage(chatId, { text: '❌ Reply to or mention the user to unblock.' }, { quoted: msg });
    let list = [];
    try { if (fs.existsSync(BLOCKED_FILE)) list = JSON.parse(fs.readFileSync(BLOCKED_FILE, 'utf8')); } catch {}
    list = list.filter((j) => j !== target);
    fs.writeFileSync(BLOCKED_FILE, JSON.stringify(list, null, 2));
    try { await sock.updateBlockStatus(target, 'unblock'); } catch {}
    await sock.sendMessage(chatId, { text: `✅ Unblocked @${target.split('@')[0]}.`, mentions: [target] }, { quoted: msg });
  }
};
