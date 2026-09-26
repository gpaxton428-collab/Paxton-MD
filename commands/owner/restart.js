export default {
  name: 'restart',
  alias: ['reboot'],
  ownerOnly: true,
  strictOwner: true,
  description: 'Restart the bot process (owner only — your host must auto-restart on exit: Docker restart policy, Fly, Koyeb, pm2, Procfile worker). Usage: .restart',
  async execute(sock, msg) {
    await sock.sendMessage(msg.key.remoteJid, { text: '🔄 Restarting...' }, { quoted: msg });
    setTimeout(() => process.exit(0), 800);
  }
};
