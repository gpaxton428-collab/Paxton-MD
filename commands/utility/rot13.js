function rot13(str) {
  return str.replace(/[a-zA-Z]/g, (c) => {
    const base = c <= 'Z' ? 65 : 97;
    return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
  });
}

export default {
  name: 'rot13',
  description: 'Encode/decode text with ROT13. Usage: .rot13 hello',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const text = args.join(' ');
    if (!text) return sock.sendMessage(chatId, { text: '❌ Usage: .rot13 <text>' }, { quoted: msg });
    await sock.sendMessage(chatId, { text: `🔐 ${rot13(text)}` }, { quoted: msg });
  }
};
