import fs from 'fs';
import path from 'path';

const PROJECT_ROOT = process.cwd();
const MAX_CHARS = 3000;

export default {
  name: 'cat',
  ownerOnly: true,
  description: "Read a text file's contents from the bot's own directory (owner only, sandboxed). Usage: .cat <relative/path>",
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    if (!args[0]) return sock.sendMessage(chatId, { text: '❌ Usage: .cat <relative/path>' }, { quoted: msg });
    const target = path.resolve(PROJECT_ROOT, args[0]);
    if (target !== PROJECT_ROOT && !target.startsWith(PROJECT_ROOT + path.sep)) return sock.sendMessage(chatId, { text: '❌ That path is outside the project folder.' }, { quoted: msg });
    try {
      const stat = fs.statSync(target);
      if (stat.isDirectory()) return sock.sendMessage(chatId, { text: '❌ That\'s a folder — use .ls instead.' }, { quoted: msg });
      let content = fs.readFileSync(target, 'utf8');
      const truncated = content.length > MAX_CHARS;
      if (truncated) content = content.slice(0, MAX_CHARS);
      await sock.sendMessage(chatId, { text: `📄 *${args[0]}*\n\`\`\`${content}\`\`\`${truncated ? '\n\n_(truncated — use .download to get the full file)_' : ''}` }, { quoted: msg });
    } catch (error) {
      await sock.sendMessage(chatId, { text: `❌ ${error.message}` }, { quoted: msg });
    }
  }
};
