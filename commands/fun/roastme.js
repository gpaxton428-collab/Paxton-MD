const LINES = [
  'You have the confidence of someone twice as talented.',
  "You're like a cloud — when you disappear, it's a beautiful day.",
  "I'd explain it to you, but I left my crayons at home.",
  'You bring everyone so much joy... when you leave the chat.'
];

export default {
  name: 'roastme',
  description: 'Ask the bot to roast you (playfully). Usage: .roastme',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    const pick = LINES[Math.floor(Math.random() * LINES.length)];
    await sock.sendMessage(chatId, { text: `🔥 ${pick}` }, { quoted: msg });
  }
};
