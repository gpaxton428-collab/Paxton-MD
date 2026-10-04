export default {
  name: 'wordfrequency',
  alias: ['topword'],
  description: 'Find the most frequent word in a piece of text. Usage: .wordfrequency the cat sat on the mat',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const text = args.join(' ').toLowerCase();
    if (!text) return sock.sendMessage(chatId, { text: '❌ Usage: .wordfrequency <text>' }, { quoted: msg });
    const words = text.match(/[a-z0-9']+/g) || [];
    const counts = {};
    for (const w of words) counts[w] = (counts[w] || 0) + 1;
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    if (!sorted.length) return sock.sendMessage(chatId, { text: '❌ No words found.' }, { quoted: msg });
    await sock.sendMessage(chatId, { text: `📊 Most frequent: *${sorted[0][0]}* (${sorted[0][1]}x)` }, { quoted: msg });
  }
};
