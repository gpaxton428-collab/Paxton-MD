export default {
  name: 'guessnumber',
  alias: ['guess'],
  description: 'Guess a number between 1-100 — the bot picks one and tells you how close you were. Usage: .guessnumber 42',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const guess = parseInt(args[0], 10);
    if (isNaN(guess) || guess < 1 || guess > 100) return sock.sendMessage(chatId, { text: '❌ Usage: .guessnumber <1-100>' }, { quoted: msg });
    const answer = Math.floor(Math.random() * 100) + 1;
    if (guess === answer) return sock.sendMessage(chatId, { text: `🎯 Exact match! The number was ${answer}. Incredible!` }, { quoted: msg });
    const diff = Math.abs(guess - answer);
    const closeness = diff <= 5 ? 'So close!' : diff <= 20 ? 'Not bad!' : 'Way off!';
    await sock.sendMessage(chatId, { text: `🔢 The number was *${answer}*. You guessed ${guess}. ${closeness}` }, { quoted: msg });
  }
};
