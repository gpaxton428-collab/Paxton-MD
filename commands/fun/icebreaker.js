const QUESTIONS = [
  "What's a hobby you've picked up recently?",
  "What's the best meal you've ever had?",
  "If you could live anywhere, where would it be?",
  "What's a movie you can watch over and over?",
  "What's something you're really good at?",
  "What's a place you'd love to travel to?"
];
export default {
  name: 'icebreaker',
  description: 'Get a random icebreaker question for group chats. Usage: .icebreaker',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    const pick = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];
    await sock.sendMessage(chatId, { text: `🧊 *Icebreaker:*\n${pick}` }, { quoted: msg });
  }
};
