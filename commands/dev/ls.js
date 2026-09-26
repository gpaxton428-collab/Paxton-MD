import fs from 'fs';
import { resolveInProject } from '../../lib/utils/safePath.js';

export default {
  name: 'ls',
  ownerOnly: true,
  description: "List files in a project folder (owner only, sandboxed). Usage: .ls [relative/path]",
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const r = resolveInProject(args.join(' ') || '.');
    if (!r.ok) return sock.sendMessage(chatId, { text: `❌ ${r.reason}` }, { quoted: msg });
    try {
      const lines = fs.readdirSync(r.path, { withFileTypes: true })
        .filter((e) => !['node_modules', '.git', 'session', 'temp_sessions'].includes(e.name) && !/^\.env/i.test(e.name))
        .map((e) => (e.isDirectory() ? `📁 ${e.name}/` : `📄 ${e.name}`));
      await sock.sendMessage(chatId, { text: `📂 *${r.relative}*\n${lines.join('\n') || '(empty)'}` }, { quoted: msg });
    } catch { await sock.sendMessage(chatId, { text: '❌ Could not list that folder.' }, { quoted: msg }); }
  }
};
