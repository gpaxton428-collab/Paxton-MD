import fs from 'fs';
import { resolveInProject } from '../../lib/utils/safePath.js';
import { redact } from '../../lib/utils/redact.js';

const MAX_CHARS = 3000;

export default {
  name: 'cat',
  ownerOnly: true,
  description: "Read a text file from the bot's folder (owner only; credential files are blocked). Usage: .cat <relative/path>",
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    if (!args[0]) return sock.sendMessage(chatId, { text: '❌ Usage: .cat <relative/path>' }, { quoted: msg });
    const r = resolveInProject(args.join(' '), { allowRoot: false });
    if (!r.ok) return sock.sendMessage(chatId, { text: `❌ ${r.reason}` }, { quoted: msg });
    try {
      const stat = fs.statSync(r.path);
      if (stat.isDirectory()) return sock.sendMessage(chatId, { text: "❌ That's a folder — use .ls instead." }, { quoted: msg });
      if (stat.size > 2 * 1024 * 1024) return sock.sendMessage(chatId, { text: '❌ File is too large to preview.' }, { quoted: msg });
      let content = redact(fs.readFileSync(r.path, 'utf8'));
      const truncated = content.length > MAX_CHARS;
      if (truncated) content = content.slice(0, MAX_CHARS);
      await sock.sendMessage(chatId, { text: `📄 *${r.relative}*\n\`\`\`${content}\`\`\`${truncated ? '\n\n_(truncated — use .download for the full file)_' : ''}` }, { quoted: msg });
    } catch { await sock.sendMessage(chatId, { text: '❌ Could not read that file.' }, { quoted: msg }); }
  }
};
