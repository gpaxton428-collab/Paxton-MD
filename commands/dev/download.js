import fs from 'fs';
import path from 'path';

const PROJECT_ROOT = process.cwd();
const MAX_BYTES = 25 * 1024 * 1024; // WhatsApp document limit is generous, but keep it sane

export default {
  name: 'download',
  ownerOnly: true,
  description: "Send a file from the bot's own directory as a document (owner only, sandboxed). Usage: .download <relative/path>",
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    if (!args[0]) return sock.sendMessage(chatId, { text: '❌ Usage: .download <relative/path>' }, { quoted: msg });
    const target = path.resolve(PROJECT_ROOT, args[0]);
    if (target !== PROJECT_ROOT && !target.startsWith(PROJECT_ROOT + path.sep)) return sock.sendMessage(chatId, { text: '❌ That path is outside the project folder.' }, { quoted: msg });
    try {
      const stat = fs.statSync(target);
      if (stat.isDirectory()) return sock.sendMessage(chatId, { text: '❌ That\'s a folder — zip it first, or use .ls / .cat.' }, { quoted: msg });
      if (stat.size > MAX_BYTES) return sock.sendMessage(chatId, { text: `❌ File is too large (${(stat.size / 1024 / 1024).toFixed(1)}MB).` }, { quoted: msg });
      await sock.sendMessage(chatId, { document: fs.readFileSync(target), fileName: path.basename(target), mimetype: 'application/octet-stream' }, { quoted: msg });
    } catch (error) {
      await sock.sendMessage(chatId, { text: `❌ ${error.message}` }, { quoted: msg });
    }
  }
};
