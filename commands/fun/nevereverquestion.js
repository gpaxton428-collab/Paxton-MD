const QUESTIONS = [
  'Never have I ever pretended to be sick to skip something.',
  'Never have I ever sent a text to the wrong person.',
  'Never have I ever forgotten someone\'s name right after they told me.',
  'Never have I ever eaten food off the floor.',
  'Never have I ever fallen asleep during a movie in a cinema.',
  'Never have I ever pretended to know a topic I knew nothing about.'
];
export default {
  name: 'nevereverquestion',
  description: "Get a random 'never have I ever' question. Usage: .nevereverquestion",
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    const pick = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];
    await sock.sendMessage(chatId, { text: `🙊 *Never Have I Ever*\n${pick}` }, { quoted: msg });
  }
};
