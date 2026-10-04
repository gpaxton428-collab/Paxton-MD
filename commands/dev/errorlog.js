export default {
  name: 'errorlog',
  alias: ['lasterror'],
  ownerOnly: true,
  strictOwner: true,
  description: "Show the last error the bot logged internally, if any (owner only). Usage: .errorlog",
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    const last = globalThis.__paxtonLastError;
    if (!last) return sock.sendMessage(chatId, { text: 'ℹ️ No errors logged since the bot started.' }, { quoted: msg });
    await sock.sendMessage(chatId, { text: `🪵 *Last Error*\n${last.time}\n\n\`\`\`${String(last.message ?? '').slice(0, 3000)}\`\`\`` }, { quoted: msg });
  }
};
