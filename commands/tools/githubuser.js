import { safeErrorMessage } from '../../lib/utils/errors.js';
export default {
  name: 'githubuser',
  description: "Look up a GitHub user/org's public profile. Usage: .githubuser <username>",
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const username = args[0];
    if (!username) return sock.sendMessage(chatId, { text: '❌ Usage: .githubuser <username>' }, { quoted: msg });
    try {
      const res = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`);
      const data = await res.json();
      if (data.message === 'Not Found') return sock.sendMessage(chatId, { text: `❌ No GitHub user "${username}" found.` }, { quoted: msg });
      const text = `👤 *${data.login}*${data.name ? ` (${data.name})` : ''}\n\n` +
        `📝 ${data.bio || 'No bio.'}\n` +
        `📦 Public repos: ${data.public_repos}\n` +
        `👥 Followers: ${data.followers}\n` +
        `🔗 ${data.html_url}`;
      if (data.avatar_url) {
        await sock.sendMessage(chatId, { image: { url: data.avatar_url }, caption: text }, { quoted: msg });
      } else {
        await sock.sendMessage(chatId, { text }, { quoted: msg });
      }
    } catch (error) {
      await sock.sendMessage(chatId, { text: `❌ Failed: ${safeErrorMessage(error)}` }, { quoted: msg });
    }
  }
};
