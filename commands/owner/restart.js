export default {
  name: 'restart',
  ownerOnly: true,
  description: 'Restart the bot process (owner only).',
  async execute(sock, msg) {
    await sock.sendMessage(msg.key.remoteJid, { text: '🔄 Restarting...' }, { quoted: msg });
    setTimeout(() => process.exit(0), 800);
  }
};
