import fs from 'fs';
import path from 'path';
import { resolveInProject } from '../../lib/utils/safePath.js';

const MAX_BYTES = 25 * 1024 * 1024;

export default {
  name: 'download',
  ownerOnly: true,
  description: "Send a file from the bot's folder as a document (owner only, sandboxed; credential files are blocked). Usage: .download <relative/path>",
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    if (!args[0]) return sock.sendMessage(chatId, { text: '❌ Usage: .download <relative/path>' }, { quoted: msg });
    const r = resolveInProject(args.join(' '), { allowRoot: false });
    if (!r.ok) return sock.sendMessage(chatId, { text: `❌ ${r.reason}` }, { quoted: msg });
    try {
      const stat = fs.statSync(r.path);
      if (stat.isDirectory()) return sock.sendMessage(chatId, { text: "❌ That's a folder — use .ls or .cat." }, { quoted: msg });
      if (stat.size > MAX_BYTES) return sock.sendMessage(chatId, { text: `❌ File is too large (${(stat.size / 1024 / 1024).toFixed(1)}MB).` }, { quoted: msg });
      await sock.sendMessage(chatId, { document: fs.readFileSync(r.path), fileName: path.basename(r.path), mimetype: 'application/octet-stream' }, { quoted: msg });
    } catch { await sock.sendMessage(chatId, { text: '❌ Could not read that file.' }, { quoted: msg }); }
  }
};
