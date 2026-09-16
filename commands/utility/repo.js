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
        const text = `╭─❏ 👑『 *BOT REPO* 』👑\n├❏ 👤 Owner: ${data.owner?.login || 'gpaxton428-collab'}\n├❏ ⭐ Total stars: ${data.stargazers_count ?? 0}\n├❏ 🍴 Total forks: ${data.forks_count ?? 0}\n├❏ 👁️ Watchers: ${data.watchers_count ?? 0}\n├❏ 🐛 Open issues: ${data.open_issues_count ?? 0}\n├❏ 📝 License: ${data.license?.name || 'MIT'}\n├❏ 🔗 ${repoUrl}\n╰─❏ ᴘᴏᴡᴇʀᴇᴅ ʙʏ Paxton-Tech`;
        return sock.sendMessage(chatId, { text }, { quoted: msg });
      }
      throw new Error('GitHub API returned no data');
    } catch {
      const text = `╭─❏ 👑『 *BOT REPO* 』👑\n├❏ 🔗 ${repoUrl}\n╰─❏ ᴘᴏᴡᴇʀᴇᴅ ʙʏ Paxton-Tech`;
      await sock.sendMessage(chatId, { text }, { quoted: msg });
    }
  }
};
