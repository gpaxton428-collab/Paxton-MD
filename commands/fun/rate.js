export default {
  name: 'rate',
  description: 'Get a random rating out of 100 for anything. Usage: .rate my cooking skills',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const thing = args.join(' ');
    if (!thing) return sock.sendMessage(chatId, { text: '❌ Usage: .rate <anything>' }, { quoted: msg });
    const score = Math.floor(Math.random() * 101);
    await sock.sendMessage(chatId, { text: `📊 I rate "${thing}" *${score}/100*` }, { quoted: msg });
  }
};
