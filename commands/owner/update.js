import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);

const REPO_URL = process.env.GITHUB_REPO_URL || '';

export default {
  name: 'update',
  ownerOnly: true,
  description: 'Pull the latest code from the bot repo and restart (owner only). Requires git to be installed and this to be a git working directory (or one with no local changes to lose).',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    if (!REPO_URL) {
      try {
        await execAsync('git remote get-url origin');
      } catch {
        return sock.sendMessage(chatId, { text: '❌ No git remote set up and no GITHUB_REPO_URL configured in .env. Push this project to your own repo, or set GITHUB_REPO_URL, then try again.' }, { quoted: msg });
      }
    }
    await sock.sendMessage(chatId, { text: '🔄 Checking for updates...' }, { quoted: msg });

    try {
      // Make sure a remote exists — if this wasn't deployed via `git clone`,
      // there's no origin to pull from yet, so set one up pointing at the
      // bot's repo.
      try {
        await execAsync('git remote get-url origin');
      } catch {
        if (!REPO_URL) throw new Error('No git remote configured');
        await execAsync('git init').catch(() => {});
        await execAsync(`git remote add origin ${REPO_URL}`).catch(() => {});
      }

      const { stdout: beforeHash } = await execAsync('git rev-parse HEAD').catch(() => ({ stdout: '' }));
      await execAsync('git fetch origin');
      const { stdout: pullOut } = await execAsync('git reset --hard origin/main').catch(async () => {
        return await execAsync('git reset --hard origin/master');
      });
      const { stdout: afterHash } = await execAsync('git rev-parse HEAD').catch(() => ({ stdout: '' }));

      if (beforeHash.trim() === afterHash.trim()) {
        return sock.sendMessage(chatId, { text: '✅ Already up to date.' }, { quoted: msg });
      }

      await sock.sendMessage(chatId, {
        text: `✅ Updated!\n\`\`\`${pullOut.trim().slice(0, 500)}\`\`\`\n\n⚠️ Run \`npm install\` if dependencies changed, then restart the bot for changes to take effect.`
      }, { quoted: msg });
    } catch (error) {
      await sock.sendMessage(chatId, { text: `❌ Update failed: ${error.message}\n\nMake sure git is installed and this was deployed as a git repo.` }, { quoted: msg });
    }
  }
};
