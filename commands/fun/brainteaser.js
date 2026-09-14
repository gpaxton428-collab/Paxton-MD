const TEASERS = [
  { q: 'What has keys but no locks, space but no room, and you can enter but not go inside?', a: 'A keyboard' },
  { q: 'The more you take, the more you leave behind. What am I?', a: 'Footsteps' },
  { q: 'What has a face and two hands but no arms or legs?', a: 'A clock' },
  { q: 'What gets wetter the more it dries?', a: 'A towel' },
  { q: 'I speak without a mouth and hear without ears. What am I?', a: 'An echo' }
];
export default {
  name: 'brainteaser',
  description: 'Get a random brain teaser riddle. Usage: .brainteaser',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    const pick = TEASERS[Math.floor(Math.random() * TEASERS.length)];
    await sock.sendMessage(chatId, { text: `🧩 *Brain Teaser:*\n${pick.q}\n\n_Reply with your guess — answer: ||${pick.a}||_` }, { quoted: msg });
  }
};
