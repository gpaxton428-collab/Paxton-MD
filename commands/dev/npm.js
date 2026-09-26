import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);
// Only these subcommands are allowed — no arbitrary shell strings, and
// execFile (not exec) means no shell interpolation risk either way.
const ALLOWED = ['list', 'ls', 'outdated', 'view', '--version'];

export default {
  name: 'npm',
  ownerOnly: true,
  description: "Run a read-only npm subcommand on the bot's own server (owner only). Usage: .npm list|outdated|view <pkg>|--version",
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const sub = args[0];
    if (!sub || !ALLOWED.includes(sub)) {
      return sock.sendMessage(chatId, { text: `❌ Only read-only subcommands are allowed: ${ALLOWED.join(', ')}` }, { quoted: msg });
    }
    try {
      const { stdout, stderr } = await execFileAsync('npm', args, { timeout: 20000, maxBuffer: 1024 * 1024 });
      const output = (stdout || stderr || '(no output)').slice(0, 3000);
      await sock.sendMessage(chatId, { text: `📦 \`\`\`${output}\`\`\`` }, { quoted: msg });
    } catch (error) {
      await sock.sendMessage(chatId, { text: `❌ ${(error.stdout || error.message || 'npm command failed').slice(0, 1000)}` }, { quoted: msg });
    }
  }
};
