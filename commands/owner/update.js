import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { config, ROOT_DIR } from '../../config/index.js';
import { downloadBuffer } from '../../lib/utils/http.js';
import { logger } from '../../lib/utils/logger.js';
import { redact } from '../../lib/utils/redact.js';
const execAsync = promisify(exec);

// Local config / runtime state that an update must never overwrite.
const PRESERVE = new Set([
  '.env', 'data', 'session', 'temp_sessions', 'session_id.txt',
  'bot_mode.json', 'prefix_config.json', 'bot_settings.json', 'owner.json',
  'whitelist.json', 'node_modules', '.git'
]);

const REPO_RE = /^[A-Za-z0-9-]{1,39}\/[A-Za-z0-9._-]{1,100}$/;
const BRANCH_RE = /^[A-Za-z0-9._/-]{1,80}$/;

async function gitUpdate(repo, branch) {
  const url = `https://github.com/${repo}.git`;
  const run = (cmd) => execAsync(cmd, { cwd: ROOT_DIR, timeout: 120000 });
  await run('git rev-parse --is-inside-work-tree'); // throws if not a git checkout -> zip fallback
  const { stdout: before } = await run('git rev-parse HEAD').catch(() => ({ stdout: '' }));
  await run(`git fetch ${url} ${branch}`);
  await run('git reset --hard FETCH_HEAD');
  const { stdout: after } = await run('git rev-parse HEAD').catch(() => ({ stdout: '' }));
  return { changed: before.trim() !== after.trim(), summary: `HEAD ${after.trim().slice(0, 7) || 'unknown'}` };
}

async function zipUpdate(repo, branch) {
  const AdmZip = (await import('adm-zip')).default;
  const { buffer } = await downloadBuffer(`https://github.com/${repo}/archive/refs/heads/${branch}.zip`, { maxBytes: 60 * 1024 * 1024, timeoutMs: 90000, rejectTypes: /^text\/html/i });
  const zip = new AdmZip(buffer);
  let written = 0;
  for (const entry of zip.getEntries()) {
    if (entry.isDirectory) continue;
    const relPath = entry.entryName.split('/').slice(1).join('/'); // strip archive root folder
    if (!relPath) continue;
    if (PRESERVE.has(relPath.split('/')[0])) continue;
    const dest = path.resolve(ROOT_DIR, relPath);
    // Zip-slip guard: never write outside the project folder.
    if (!dest.startsWith(ROOT_DIR + path.sep)) continue;
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, entry.getData());
    written++;
  }
  return { changed: written > 0, summary: `${written} file(s) updated from the latest archive.` };
}

export default {
  name: 'update',
  ownerOnly: true,
  strictOwner: true,
  description: 'Pull the latest code from your configured repo (owner only). Requires UPDATE_REPO=owner/repo. .env/session/data are never touched. Not useful in Docker (rebuild the image instead).',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    const repo = config.security.updateRepo;
    const branch = config.security.updateBranch;
    if (!repo) return sock.sendMessage(chatId, { text: '🔒 *.update is not configured.*\nSet UPDATE_REPO=owner/repo (and optionally UPDATE_BRANCH) in the environment. On Docker/Fly/Koyeb, redeploy instead.' }, { quoted: msg });
    if (!REPO_RE.test(repo) || !BRANCH_RE.test(branch)) return sock.sendMessage(chatId, { text: '❌ UPDATE_REPO / UPDATE_BRANCH have an invalid format.' }, { quoted: msg });
    await sock.sendMessage(chatId, { text: `🔄 Checking *${repo}* (${branch}) for updates...` }, { quoted: msg });
    try {
      let result;
      try { result = await gitUpdate(repo, branch); }
      catch (gitError) {
        logger.warn('update', `git unavailable, using zip: ${redact(String(gitError.message).split('\n')[0])}`);
        result = await zipUpdate(repo, branch);
      }
      if (!result.changed) return sock.sendMessage(chatId, { text: '✅ Already up to date.' }, { quoted: msg });
      await sock.sendMessage(chatId, { text: `✅ Updated! ${result.summary}\n\n⚠️ Run \`npm install\` if dependencies changed, then restart the bot.` }, { quoted: msg });
    } catch (error) {
      logger.error('update', error);
      await sock.sendMessage(chatId, { text: '❌ Update failed. Check that UPDATE_REPO is correct and public. Details are in the server log.' }, { quoted: msg });
    }
  }
};
