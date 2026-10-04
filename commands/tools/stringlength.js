export default {
  name: 'stringlength',
  alias: ['strlen'],
  description: 'Get the length of a string in characters, words, and bytes. Usage: .stringlength hello world',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const text = args.join(' ');
    if (!text) return sock.sendMessage(chatId, { text: '❌ Usage: .stringlength <text>' }, { quoted: msg });
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const bytes = Buffer.byteLength(text, 'utf8');
    await sock.sendMessage(chatId, { text: `📏 Characters: ${text.length}\nWords: ${words}\nBytes: ${bytes}` }, { quoted: msg });
  }
};
