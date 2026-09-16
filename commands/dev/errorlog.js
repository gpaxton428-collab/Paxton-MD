export default {
  name: 'errorlog',
  alias: ['lasterror'],
  ownerOnly: true,
  description: "Show the last error the bot logged internally, if any (owner only). Usage: .errorlog",
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    const last = global.__paxtonLastError;
    if (!last) return sock.sendMessage(chatId, { text: 'ℹ️ No errors logged since the bot started.' }, { quoted: msg });
    await sock.sendMessage(chatId, { text: `🪵 *Last Error*\n${last.time}\n\n\`\`\`${last.message}\`\`\`` }, { quoted: msg });
  }
};
