const LINES = [
  'The journey of a thousand miles begins with a single step.',
  'Fall seven times, stand up eight.',
  'A smooth sea never made a skilled sailor.',
  'What you do today can improve all your tomorrows.',
  'The best time to plant a tree was 20 years ago. The second best time is now.'
];

export default {
  name: 'wisdom',
  description: 'Get a random piece of wisdom. Usage: .wisdom',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    const pick = LINES[Math.floor(Math.random() * LINES.length)];
    await sock.sendMessage(chatId, { text: `🧠 ${pick}` }, { quoted: msg });
  }
};
