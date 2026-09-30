const MOVES = ['rock', 'paper', 'scissors'];
const EMOJI = { rock: '🪨', paper: '📄', scissors: '✂️' };
const BEATS = { rock: 'scissors', paper: 'rock', scissors: 'paper' };

export default {
  name: 'rps',
  description: 'Play rock-paper-scissors against the bot. Usage: .rps rock',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const userMove = (args[0] || '').toLowerCase();
    if (!MOVES.includes(userMove)) return sock.sendMessage(chatId, { text: '❌ Usage: .rps rock|paper|scissors' }, { quoted: msg });
    const botMove = MOVES[Math.floor(Math.random() * MOVES.length)];
    let result;
    if (userMove === botMove) result = "It's a tie!";
    else if (BEATS[userMove] === botMove) result = 'You win! 🎉';
    else result = 'I win! 🤖';
    await sock.sendMessage(chatId, { text: `You: ${EMOJI[userMove]}  Bot: ${EMOJI[botMove]}\n\n${result}` }, { quoted: msg });
  }
};
