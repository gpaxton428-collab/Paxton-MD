export default {
  name: 'time',
  alias: ['worldtime'],
  description: 'Show the current time in a given IANA timezone. Usage: .time Africa/Johannesburg',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const tz = args.join(' ') || 'UTC';
    try {
      const formatter = new Intl.DateTimeFormat('en-GB', { timeZone: tz, dateStyle: 'full', timeStyle: 'medium' });
      await sock.sendMessage(chatId, { text: `🕐 *${tz}*\n${formatter.format(new Date())}` }, { quoted: msg });
    } catch {
      await sock.sendMessage(chatId, { text: '❌ Unknown timezone. Example: .time Africa/Johannesburg' }, { quoted: msg });
    }
  }
};
