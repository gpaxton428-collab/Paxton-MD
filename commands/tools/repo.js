import { sendInteractive, urlButton, quickButton } from '../../lib/helpers/interactive.js';
export default {
  name: 'repo',
  alias: ['sc', 'source'],
  description: "Show the bot's source repository with live stats (stars, forks, owner). Usage: .repo",
  async execute(sock, msg, args, currentPrefix, ctx) {
    const chatId = msg.key.remoteJid;
    const repoUrl = 'https://github.com/gpaxton428-collab/Paxton-MD';
    try {
      const res = await fetch('https://api.github.com/repos/gpaxton428-collab/Paxton-MD');
      const data = await res.json();
      if (data && !data.message) {
        const text = `📦 *Bot Repository*\n\n` +
          `Owner: ${data.owner?.login || 'gpaxton428-collab'}\n` +
          `Stars: ${data.stargazers_count ?? 0}\n` +
          `Forks: ${data.forks_count ?? 0}\n` +
          `Watchers: ${data.watchers_count ?? 0}\n` +
          `Open issues: ${data.open_issues_count ?? 0}\n` +
          `License: ${data.license?.name || 'MIT'}\n\n` +
          `${repoUrl}`;
        return sendInteractive(sock, chatId, { title: '📦 PAXTON-MD REPOSITORY', text, footer: 'Powered by Paxton-Tech', buttons: [urlButton('⭐ Open GitHub', repoUrl), quickButton('⚡ Main Menu', `${currentPrefix}menu`)], fallbackText: text }, { quoted: msg });
      }
      throw new Error('GitHub API returned no data');
    } catch {
      const text = `📦 *Bot Repository*\n\n${repoUrl}`;
      await sendInteractive(sock, chatId, { title: '📦 PAXTON-MD REPOSITORY', text, footer: 'Powered by Paxton-Tech', buttons: [urlButton('⭐ Open GitHub', repoUrl), quickButton('⚡ Main Menu', `${currentPrefix}menu`)], fallbackText: text }, { quoted: msg });
    }
  }
};
