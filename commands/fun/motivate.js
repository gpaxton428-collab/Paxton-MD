const LINES = [
  'You didn\'t come this far to only come this far. Keep going.',
  'Progress, not perfection.',
  'Small steps every day add up to big results.',
  'Discipline is choosing between what you want now and what you want most.',
  'You are more capable than you think.',
  'Every expert was once a beginner.'
];
export default {
  name: 'motivate',
  description: 'Get a motivational message. Usage: .motivate',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    const pick = LINES[Math.floor(Math.random() * LINES.length)];
    await sock.sendMessage(chatId, { text: `💪 ${pick}` }, { quoted: msg });
  }
};
