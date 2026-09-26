export default {
  name: 'githubrepo',
  description: "Look up any public GitHub repo's stats. Usage: .githubrepo <owner>/<repo>",
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const slug = args[0];
    if (!slug || !/^[\w.-]{1,100}\/[\w.-]{1,100}$/.test(slug)) return sock.sendMessage(chatId, { text: '❌ Usage: .githubrepo <owner>/<repo>' }, { quoted: msg });
    try {
      const res = await fetch(`https://api.github.com/repos/${slug}`, { signal: AbortSignal.timeout(12000), headers: { 'User-Agent': 'PaxtonMD' } });
      const data = await res.json();
      if (data.message === 'Not Found') return sock.sendMessage(chatId, { text: `❌ No repo "${slug}" found.` }, { quoted: msg });
      const text = `📦 *${data.full_name}*\n\n` +
        `📝 ${data.description || 'No description.'}\n` +
        `⭐ Stars: ${data.stargazers_count}\n` +
        `🍴 Forks: ${data.forks_count}\n` +
        `🐛 Open issues: ${data.open_issues_count}\n` +
        `📄 License: ${data.license?.name || 'None'}\n` +
        `🔗 ${data.html_url}`;
      await sock.sendMessage(chatId, { text }, { quoted: msg });
    } catch (error) {
      await sock.sendMessage(chatId, { text: '❌ *Request failed*\n\nThe service is temporarily unavailable.\nPlease try again later.' }, { quoted: msg });
    }
  }
};
