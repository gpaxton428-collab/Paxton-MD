export default {
  name: 'broadcast',
  alias: ['bc'],
  ownerOnly: true,
  description: 'Send a message to every chat the bot has stored (owner only). Usage: .broadcast <text>',
  async execute(sock, msg, args, prefix, ctx) {
    const chatId = msg.key.remoteJid;
    const text = args.join(' ').trim();
    if (!text) return sock.sendMessage(chatId, { text: '❌ Usage: .broadcast <message>' }, { quoted: msg });
    const chats = ctx.store?.chatIds ? [...ctx.store.chatIds] : [chatId];
    let sent = 0;
    for (const jid of chats) {
      try {
        await sock.sendMessage(jid, { text: `📢 *BROADCAST*\n\n${text}` });
        sent++;
        await new Promise((r) => setTimeout(r, 300));
      } catch {}
    }
    await sock.sendMessage(chatId, { text: `✅ Broadcast sent to ${sent} chat(s).` }, { quoted: msg });
  }
};
