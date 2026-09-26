import fs from 'fs';
import path from 'path';

export default {
  name: 'packageinfo',
  alias: ['deps', 'libcheck'],
  ownerOnly: true,
  description: 'List every dependency in package.json and whether it is actually installed in node_modules (owner only). Usage: .packageinfo',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    const pkg = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
    const deps = pkg.dependencies || {};
    const lines = Object.entries(deps).map(([name, version]) => {
      const installed = fs.existsSync(path.join(process.cwd(), 'node_modules', name));
      return `${installed ? '✅' : '❌'} ${name}@${version}`;
    });
    const missing = lines.filter((l) => l.startsWith('❌')).length;
    const text = `📦 *Package Info*\n\nv${pkg.version}\n${lines.join('\n')}\n\n${missing ? `⚠️ ${missing} missing — run npm install` : '✅ all installed'}`;
    await sock.sendMessage(chatId, { text }, { quoted: msg });
  }
};
