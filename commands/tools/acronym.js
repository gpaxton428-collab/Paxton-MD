export default {
  name: 'acronym',
  description: 'Turn a phrase into its acronym. Usage: .acronym as soon as possible',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    if (!args.length) return sock.sendMessage(chatId, { text: '❌ Usage: .acronym <phrase>' }, { quoted: msg });
    const acr = args.map((w) => w[0].toUpperCase()).join('');
    await sock.sendMessage(chatId, { text: `🔤 ${acr}` }, { quoted: msg });
  }
};
