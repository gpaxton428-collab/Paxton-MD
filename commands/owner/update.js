import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
const execAsync = promisify(exec);

const REPO_URL = 'https://github.com/gpaxton428-collab/Paxton-MD.git';
const ZIP_URL = 'https://github.com/gpaxton428-collab/Paxton-MD/archive/refs/heads/main.zip';

// Files/folders that should never be overwritten by an update — your own
// local config and runtime state, not the bot's source code.
const PRESERVE = new Set([
  '.env', 'data', 'session', 'temp_sessions', 'session_id.txt',
  'bot_mode.json', 'prefix_config.json', 'bot_settings.json', 'owner.json',
  'whitelist.json', 'node_modules', '.git'
]);

async function gitUpdate() {
  try {
    await execAsync('git remote get-url origin');
  } catch {
    await execAsync('git init').catch(() => {});
    await execAsync(`git remote add origin ${REPO_URL}`).catch(() => {});
  }
  const { stdout: beforeHash } = await execAsync('git rev-parse HEAD').catch(() => ({ stdout: '' }));
  await execAsync('git fetch origin');
  const { stdout: pullOut } = await execAsync('git reset --hard origin/main').catch(async () => {
    return await execAsync('git reset --hard origin/master');
  });
  const { stdout: afterHash } = await execAsync('git rev-parse HEAD').catch(() => ({ stdout: '' }));
  return { changed: beforeHash.trim() !== afterHash.trim(), summary: pullOut.trim().slice(0, 500) };
}

// No-git-needed fallback — some hosts (Katabump included, on some plans)
// don't have git available or disable git operations entirely. This just
// downloads the repo's zip archive over plain HTTPS and overwrites source
// files in place, the same way you'd re-upload a zip manually, except it
// deliberately skips your own local config/session/data files.
async function zipUpdate() {
  const AdmZip = (await import('adm-zip')).default;
  const res = await fetch(ZIP_URL);
  if (!res.ok) throw new Error(`Could not download update archive (${res.status})`);
  const buffer = Buffer.from(await res.arrayBuffer());
  const zip = new AdmZip(buffer);
  const entries = zip.getEntries();
  let written = 0;
  for (const entry of entries) {
    if (entry.isDirectory) continue;
    // Entries are nested under a "Paxton-MD-main/" root folder — strip it.
    const relPath = entry.entryName.split('/').slice(1).join('/');
    if (!relPath) continue;
    const topLevel = relPath.split('/')[0];
    if (PRESERVE.has(topLevel)) continue;
    const destPath = path.join('.', relPath);
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.writeFileSync(destPath, entry.getData());
    written++;
  }
  return { changed: written > 0, summary: `${written} file(s) updated from the latest zip archive.` };
}

export default {
  name: 'update',
  ownerOnly: true,
  description: 'Fetch the latest bot code from GitHub and restart (owner only). Tries git first, falls back to a direct zip download if git is unavailable — either way, your .env/session/data files are never touched.',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    await sock.sendMessage(chatId, { text: '🔄 Checking for updates...' }, { quoted: msg });
    try {
      let result;
      try {
        result = await gitUpdate();
      } catch (gitError) {
        await sock.sendMessage(chatId, { text: `ℹ️ Git update unavailable (${gitError.message.split('\n')[0]}) — falling back to a direct zip download...` }, { quoted: msg });
        result = await zipUpdate();
      }
      if (!result.changed) {
        return sock.sendMessage(chatId, { text: '✅ Already up to date.' }, { quoted: msg });
      }
      await sock.sendMessage(chatId, {
        text: `✅ Updated!\n\`\`\`${result.summary}\`\`\`\n\n⚠️ Run \`npm install\` if dependencies changed, then restart the bot for changes to take effect.`
      }, { quoted: msg });
    } catch (error) {
      await sock.sendMessage(chatId, { text: `❌ Update failed: ${error.message}` }, { quoted: msg });
    }
  }
};
