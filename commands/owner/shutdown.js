export default {
  name: 'shutdown',
  ownerOnly: true,
  description: 'Shut the bot down completely (owner only). Requires manual restart.',
  async execute(sock, msg) {
    await sock.sendMessage(msg.key.remoteJid, { text: '🛑 Shutting down. Goodbye.' }, { quoted: msg });
    setTimeout(() => process.exit(1), 800);
  }
};
