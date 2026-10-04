export default {
  name: 'duration',
  description: 'Parse a duration like 2h30m into total seconds. Usage: .duration 2h30m',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const text = args.join('');
    if (!text) return sock.sendMessage(chatId, { text: '❌ Usage: .duration <e.g. 1h30m, 45m, 2h>' }, { quoted: msg });
    const regex = /(\d+)\s*(h|m|s)/gi;
    let totalSeconds = 0;
    let match;
    let matched = false;
    while ((match = regex.exec(text)) !== null) {
      matched = true;
      const value = parseInt(match[1], 10);
      const unit = match[2].toLowerCase();
      totalSeconds += unit === 'h' ? value * 3600 : unit === 'm' ? value * 60 : value;
    }
    if (!matched) return sock.sendMessage(chatId, { text: '❌ Could not parse that duration. Try like 1h30m.' }, { quoted: msg });
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    await sock.sendMessage(chatId, { text: `⏱️ ${totalSeconds}s total (${h}h ${m}m ${s}s)` }, { quoted: msg });
  }
};
