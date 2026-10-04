export default {
  name: 'passwordgen',
  description: 'Generate a strong random password. Usage: .passwordgen [length]',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const len = Math.min(Math.max(parseInt(args[0]) || 16, 6), 64);
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let pass = '';
    for (let i = 0; i < len; i++) pass += chars[Math.floor(Math.random() * chars.length)];
    await sock.sendMessage(chatId, { text: `🔐 *Generated Password (${len} chars):*\n\`${pass}\`` }, { quoted: msg });
  }
};
