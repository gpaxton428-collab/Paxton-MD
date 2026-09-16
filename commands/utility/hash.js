import crypto from 'crypto';

export default {
  name: 'hash',
  description: 'Get the MD5 and SHA256 hash of text. Usage: .hash mypassword',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const text = args.join(' ');
    if (!text) return sock.sendMessage(chatId, { text: '❌ Usage: .hash <text>' }, { quoted: msg });
    const md5 = crypto.createHash('md5').update(text).digest('hex');
    const sha256 = crypto.createHash('sha256').update(text).digest('hex');
    await sock.sendMessage(chatId, { text: `🔒 *MD5:* ${md5}\n*SHA256:* ${sha256}` }, { quoted: msg });
  }
};
