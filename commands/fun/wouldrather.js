const QUESTIONS = [
  'Would you rather have the ability to fly or be invisible?',
  'Would you rather always be 10 minutes late or 20 minutes early?',
  'Would you rather give up your phone for a month or your car for a year?',
  'Would you rather live without music or without TV/movies?',
  'Would you rather be able to talk to animals or speak every human language?',
  'Would you rather have unlimited money or unlimited time?'
];
export default {
  name: 'wouldrather',
  description: "Get a random 'would you rather' question. Usage: .wouldrather",
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    const pick = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];
    await sock.sendMessage(chatId, { text: `🤔 *Would You Rather?*\n${pick}` }, { quoted: msg });
  }
};
