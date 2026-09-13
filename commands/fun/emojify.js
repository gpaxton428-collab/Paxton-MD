const MAP = { a: '🅰️', b: '🅱️', o: '🅾️', ok: '🆗' };

export default {
  name: 'emojify',
  description: 'Turn text into regional-indicator emoji letters. Usage: .emojify hello',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const text = args.join(' ').toLowerCase();
    if (!text) return sock.sendMessage(chatId, { text: '❌ Usage: .emojify <text>' }, { quoted: msg });
    const out = [...text].map((ch) => {
      if (ch === ' ') return '  ';
      if (ch >= 'a' && ch <= 'z') return String.fromCodePoint(0x1f1e6 + (ch.charCodeAt(0) - 97)) ;
      return ch;
    }).join(' ');
    await sock.sendMessage(chatId, { text: out }, { quoted: msg });
  }
};
