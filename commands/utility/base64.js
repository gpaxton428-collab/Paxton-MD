export default {
  name: 'base64',
  description: 'Encode or decode base64 text. Usage: .base64 encode hello / .base64 decode aGVsbG8=',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const mode = args[0];
    const text = args.slice(1).join(' ');
    if (!['encode', 'decode'].includes(mode) || !text) {
      return sock.sendMessage(chatId, { text: '❌ Usage: .base64 encode|decode <text>' }, { quoted: msg });
    }
    try {
      const result = mode === 'encode'
        ? Buffer.from(text, 'utf8').toString('base64')
        : Buffer.from(text, 'base64').toString('utf8');
      await sock.sendMessage(chatId, { text: `🔐 ${result}` }, { quoted: msg });
    } catch (error) {
      await sock.sendMessage(chatId, { text: `❌ Failed: ${error.message}` }, { quoted: msg });
    }
  }
};
