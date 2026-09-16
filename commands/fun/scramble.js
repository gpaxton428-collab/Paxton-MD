const WORDS = ['whatsapp', 'developer', 'javascript', 'keyboard', 'elephant', 'mountain', 'sandwich'];

export default {
  name: 'scramble',
  description: 'Get a scrambled word to guess (answer included, for solo practice).',
  async execute(sock, msg) {
    const word = WORDS[Math.floor(Math.random() * WORDS.length)];
    const scrambled = word.split('').sort(() => Math.random() - 0.5).join('');
    await sock.sendMessage(msg.key.remoteJid, { text: `🔤 Unscramble this: *${scrambled}*\n\n_Answer: ${word}_` }, { quoted: msg });
  }
};
