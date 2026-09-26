export default {
  name: 'timestamp',
  description: 'Convert a unix timestamp to a readable date. Usage: .timestamp 1700000000',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const ts = parseInt(args[0], 10);
    if (isNaN(ts)) return sock.sendMessage(chatId, { text: '❌ Usage: .timestamp <unix timestamp>' }, { quoted: msg });
    const ms = ts > 9999999999 ? ts : ts * 1000;
    const date = new Date(ms);
    if (isNaN(date.getTime())) return sock.sendMessage(chatId, { text: '❌ Invalid timestamp.' }, { quoted: msg });
    await sock.sendMessage(chatId, { text: `📅 ${date.toUTCString()}` }, { quoted: msg });
  }
};
