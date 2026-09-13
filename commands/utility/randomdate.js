export default {
  name: 'randomdate',
  description: 'Get a random date between two years. Usage: .randomdate 2000 2025',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const startYear = parseInt(args[0], 10) || 2000;
    const endYear = parseInt(args[1], 10) || new Date().getFullYear();
    if (startYear > endYear) return sock.sendMessage(chatId, { text: '❌ Start year must be before end year.' }, { quoted: msg });
    const start = new Date(startYear, 0, 1).getTime();
    const end = new Date(endYear, 11, 31).getTime();
    const date = new Date(start + Math.random() * (end - start));
    await sock.sendMessage(chatId, { text: `📅 ${date.toDateString()}` }, { quoted: msg });
  }
};
