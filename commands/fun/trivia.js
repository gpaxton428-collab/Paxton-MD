const TRIVIA = [
  { q: 'What is the capital of Australia?', a: 'Canberra' },
  { q: 'How many continents are there?', a: '7' },
  { q: 'What planet is known as the Red Planet?', a: 'Mars' },
  { q: 'What is the largest ocean on Earth?', a: 'Pacific Ocean' },
  { q: 'Who wrote Romeo and Juliet?', a: 'William Shakespeare' }
];

export default {
  name: 'trivia',
  description: 'Get a random trivia question (with the answer included).',
  async execute(sock, msg) {
    const t = TRIVIA[Math.floor(Math.random() * TRIVIA.length)];
    await sock.sendMessage(msg.key.remoteJid, { text: `❓ ${t.q}\n\n_Answer: ${t.a}_` }, { quoted: msg });
  }
};
