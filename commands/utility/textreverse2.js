export default {
  name: 'wordreverse',
  description: 'Reverse the order of words in a sentence (not the letters). Usage: .wordreverse the quick brown fox',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    if (!args.length) return sock.sendMessage(chatId, { text: '❌ Usage: .wordreverse <sentence>' }, { quoted: msg });
    await sock.sendMessage(chatId, { text: args.slice().reverse().join(' ') }, { quoted: msg });
  }
};
