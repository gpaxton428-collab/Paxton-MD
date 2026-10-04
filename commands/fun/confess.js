export default {
  name: 'confess',
  description: "Send an anonymous confession into the chat (nobody's name is attached). Usage: .confess <text>",
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const text = args.join(' ');
    if (!text) return sock.sendMessage(chatId, { text: '❌ Usage: .confess <text>' }, { quoted: msg });
    try { await sock.sendMessage(chatId, { delete: msg.key }); } catch {}
    await sock.sendMessage(chatId, { text: `🕵️ *Anonymous Confession*\n\n"${text}"` });
  }
};
