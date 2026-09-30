import os from 'os';

export default {
  name: 'sysinfo',
  ownerOnly: true,
  description: 'Show host system info (owner only).',
  async execute(sock, msg) {
    const text = `🖥️ *SYSTEM INFO*\n\n` +
      `Platform: ${os.platform()} ${os.arch()}\n` +
      `CPU cores: ${os.cpus().length}\n` +
      `Total RAM: ${(os.totalmem() / 1024 / 1024 / 1024).toFixed(1)}GB\n` +
      `Free RAM: ${(os.freemem() / 1024 / 1024 / 1024).toFixed(1)}GB\n` +
      `Node: ${process.version}\n` +
      `Uptime: ${Math.floor(os.uptime() / 3600)}h`;
    await sock.sendMessage(msg.key.remoteJid, { text }, { quoted: msg });
  }
};
