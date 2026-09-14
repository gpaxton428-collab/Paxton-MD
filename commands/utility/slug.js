export default {
  name: 'slug',
  description: 'Convert text into a URL-friendly slug. Usage: .slug My Blog Post Title',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const text = args.join(' ');
    if (!text) return sock.sendMessage(chatId, { text: '❌ Usage: .slug <text>' }, { quoted: msg });
    const slug = text.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
    await sock.sendMessage(chatId, { text: `🔗 ${slug}` }, { quoted: msg });
  }
};
