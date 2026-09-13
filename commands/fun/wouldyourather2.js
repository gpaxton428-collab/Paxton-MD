const PAIRS = [
  ['have the ability to fly', 'have the ability to turn invisible'],
  ['always be 10 minutes late', 'always be 20 minutes early'],
  ['give up your phone for a month', 'give up your favorite food for a year'],
  ['be able to speak every language', 'be able to talk to animals'],
  ['live without music', 'live without movies']
];

export default {
  name: 'wouldyourather2',
  alias: ['wyr2'],
  description: 'Get another random "would you rather" question. Usage: .wyr2',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    const pair = PAIRS[Math.floor(Math.random() * PAIRS.length)];
    await sock.sendMessage(chatId, { text: `🤔 Would you rather ${pair[0]}, or ${pair[1]}?` }, { quoted: msg });
  }
};
