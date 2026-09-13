const QUESTIONS = [
  'have the ability to fly, or be invisible?',
  'always be 10 minutes late, or always be 20 minutes early?',
  'live without music, or live without movies?',
  'have unlimited money but no friends, or unlimited friends but no money?',
  'be able to speak every language, or play every instrument?',
  'know when you will die, or how you will die?'
];

export default {
  name: 'wyr',
  alias: ['wouldyourather'],
  description: 'Get a random "would you rather" question.',
  async execute(sock, msg) {
    const q = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];
    await sock.sendMessage(msg.key.remoteJid, { text: `🤔 Would you rather ${q}` }, { quoted: msg });
  }
};
