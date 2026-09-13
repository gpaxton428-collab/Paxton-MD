const LINES = [
  'Are you a magician? Because whenever I look at you, everyone else disappears.',
  'Do you have a map? I keep getting lost in your eyes.',
  'Are you made of copper and tellurium? Because you\'re Cu-Te.',
  'If you were a vegetable, you\'d be a cute-cumber.',
  'Is your name Google? Because you\'re everything I\'ve been searching for.'
];

export default {
  name: 'pickupline',
  description: 'Get a random pickup line. Usage: .pickupline',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    const pick = LINES[Math.floor(Math.random() * LINES.length)];
    await sock.sendMessage(chatId, { text: `😏 ${pick}` }, { quoted: msg });
  }
};
