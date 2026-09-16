export default {
  name: 'yodaspeak',
  alias: ['yoda'],
  description: 'Turn a sentence into Yoda-style word order. Usage: .yodaspeak I am your father',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    if (!args.length) return sock.sendMessage(chatId, { text: '❌ Usage: .yodaspeak <sentence>' }, { quoted: msg });
    const words = args.join(' ').replace(/[.?!]+$/, '').split(' ');
    if (words.length < 2) return sock.sendMessage(chatId, { text: `🧙 ${words.join(' ')}, hmm.` }, { quoted: msg });
    const mid = Math.ceil(words.length / 2);
    const flipped = [...words.slice(mid), ...words.slice(0, mid)].join(' ');
    await sock.sendMessage(chatId, { text: `🧙 ${flipped}, yes.` }, { quoted: msg });
  }
};
