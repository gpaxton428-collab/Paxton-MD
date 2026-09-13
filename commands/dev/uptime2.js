export default {
  name: 'processinfo',
  ownerOnly: true,
  description: 'Show process-level info: PID, working directory, and args (owner only). Usage: .processinfo',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    const text = [
      '⚙️ *Process Info*',
      `PID: ${process.pid}`,
      `CWD: ${process.cwd()}`,
      `Argv: ${process.argv.slice(2).join(' ') || '(none)'}`,
      `Started: ${new Date(Date.now() - process.uptime() * 1000).toLocaleString()}`
    ].join('\n');
    await sock.sendMessage(chatId, { text }, { quoted: msg });
  }
};
