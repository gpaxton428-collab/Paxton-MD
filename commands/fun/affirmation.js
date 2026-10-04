const LINES = [
  'You are capable of amazing things.',
  'Today is full of new opportunities.',
  'You bring value to everyone around you.',
  'Your hard work will pay off.',
  'You are stronger than you think.',
  'Progress, not perfection.',
  'You deserve good things.'
];

export default {
  name: 'affirmation',
  description: 'Get a random positive affirmation. Usage: .affirmation',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    const pick = LINES[Math.floor(Math.random() * LINES.length)];
    await sock.sendMessage(chatId, { text: `✨ ${pick}` }, { quoted: msg });
  }
};
