const TWISTERS = [
  'She sells seashells by the seashore.',
  'How much wood would a woodchuck chuck if a woodchuck could chuck wood?',
  'Peter Piper picked a peck of pickled peppers.',
  'Fuzzy Wuzzy was a bear, Fuzzy Wuzzy had no hair.',
  'Betty Botter bought some butter, but she said the butter’s bitter.',
  'Six slippery snails slid slowly seaward.',
  'A proper copper coffee pot.'
];

export default {
  name: 'tonguetwister',
  description: 'Get a random tongue twister to try. Usage: .tonguetwister',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    const pick = TWISTERS[Math.floor(Math.random() * TWISTERS.length)];
    await sock.sendMessage(chatId, { text: `👅 ${pick}` }, { quoted: msg });
  }
};
