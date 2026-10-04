const RHYME_BANK = {
  cat: ['bat', 'hat', 'mat', 'rat', 'sat'], day: ['play', 'stay', 'way', 'say', 'ray'],
  light: ['night', 'sight', 'right', 'bright', 'fight'], love: ['dove', 'above', 'glove']
};

export default {
  name: 'rhyme',
  description: 'Find words that rhyme with a given word (small built-in set). Usage: .rhyme cat',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const word = (args[0] || '').toLowerCase();
    const matches = RHYME_BANK[word];
    if (!matches) return sock.sendMessage(chatId, { text: `❌ No rhymes found for "${word}" in my small dictionary. Try: ${Object.keys(RHYME_BANK).join(', ')}` }, { quoted: msg });
    await sock.sendMessage(chatId, { text: `🎤 Words that rhyme with *${word}*: ${matches.join(', ')}` }, { quoted: msg });
  }
};
