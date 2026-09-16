import fs from 'fs';
import path from 'path';

const PROJECT_ROOT = process.cwd();

export default {
  name: 'ls',
  ownerOnly: true,
  description: 'List files in a project folder (owner only, sandboxed to the bot\'s own directory). Usage: .ls [relative/path]',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const rel = args.join(' ') || '.';
    const target = path.resolve(PROJECT_ROOT, rel);
    // Sandbox: never allow escaping the project root via ../
    if (target !== PROJECT_ROOT && !target.startsWith(PROJECT_ROOT + path.sep)) return sock.sendMessage(chatId, { text: '❌ That path is outside the project folder.' }, { quoted: msg });
    try {
      const entries = fs.readdirSync(target, { withFileTypes: true });
      const lines = entries
        .filter((e) => e.name !== 'node_modules' && e.name !== '.git')
        .map((e) => (e.isDirectory() ? `📁 ${e.name}/` : `📄 ${e.name}`));
      await sock.sendMessage(chatId, { text: `📂 *${path.relative(PROJECT_ROOT, target) || '.'}*\n${lines.join('\n') || '(empty)'}` }, { quoted: msg });
    } catch (error) {
      await sock.sendMessage(chatId, { text: `❌ ${error.message}` }, { quoted: msg });
    }
  }
};
