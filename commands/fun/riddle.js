const RIDDLES = [
  { q: 'What has keys but no locks, space but no room, and you can enter but not go in?', a: 'A keyboard' },
  { q: 'The more you take, the more you leave behind. What am I?', a: 'Footsteps' },
  { q: 'What has to be broken before you can use it?', a: 'An egg' },
  { q: 'I speak without a mouth and hear without ears. What am I?', a: 'An echo' },
  { q: 'What month of the year has 28 days?', a: 'All of them' }
];

export default {
  name: 'riddle',
  description: 'Get a random riddle (with the answer included).',
  async execute(sock, msg) {
    const r = RIDDLES[Math.floor(Math.random() * RIDDLES.length)];
    await sock.sendMessage(msg.key.remoteJid, { text: `🧩 ${r.q}\n\n_Answer: ${r.a}_` }, { quoted: msg });
  }
};
