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
        const text = `📦 *${ctx.BOT_NAME} Repository*\n\n` +
          `👤 Owner: ${data.owner?.login || 'gpaxton428-collab'}\n` +
          `⭐ Stars: ${data.stargazers_count ?? 0}\n` +
          `🍴 Forks: ${data.forks_count ?? 0}\n` +
          `👁️ Watchers: ${data.watchers_count ?? 0}\n` +
          `🐛 Open issues: ${data.open_issues_count ?? 0}\n` +
          `📅 Last updated: ${data.updated_at ? new Date(data.updated_at).toLocaleDateString() : 'n/a'}\n` +
          `📝 License: ${data.license?.name || 'MIT'}\n\n` +
          `${repoUrl}\n\nStar it if you find it useful ⭐`;
        return sock.sendMessage(chatId, { text }, { quoted: msg });
      }
      throw new Error('GitHub API returned no data');
    } catch {
      // Falls back to the static link if the API call fails (no network,
      // rate-limited, or the repo is private and the API can't see it).
      const text = `📦 *${ctx.BOT_NAME} Repository*\n\n${repoUrl}\n\nStar it if you find it useful ⭐`;
      await sock.sendMessage(chatId, { text }, { quoted: msg });
    }
  }
};
