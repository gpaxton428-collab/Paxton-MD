import crypto from 'crypto';

export default {
  name: 'password',
  alias: ['genpass'],
  description: 'Generate a random secure password. Usage: .password 16',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const length = Math.min(Math.max(parseInt(args[0], 10) || 16, 6), 64);
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let pass = '';
    const bytes = crypto.randomBytes(length);
    for (let i = 0; i < length; i++) pass += chars[bytes[i] % chars.length];
    await sock.sendMessage(chatId, { text: `🔑 ${pass}` }, { quoted: msg });
  }
};
