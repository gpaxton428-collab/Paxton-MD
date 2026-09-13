export default {
  name: 'ageguess',
  description: 'Playfully "guess" an age from a name (just for fun, not real). Usage: .ageguess John',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const name = args.join(' ');
    if (!name) return sock.sendMessage(chatId, { text: '❌ Usage: .ageguess <name>' }, { quoted: msg });
    let hash = 0;
    for (const ch of name.toLowerCase()) hash = (hash * 31 + ch.charCodeAt(0)) % 1000;
    const age = 12 + (hash % 60);
    await sock.sendMessage(chatId, { text: `🔮 I guess *${name}* is around *${age}* years old! (just for fun)` }, { quoted: msg });
  }
};
