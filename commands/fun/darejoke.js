const DARES = [
  'Send a voice note singing your favorite song.',
  'Text the last person you called and say "I miss you" (no context).',
  'Change your profile picture to something silly for 1 hour.',
  'Type your next message using only emojis.',
  'Compliment the last 3 people who texted you.'
];

export default {
  name: 'harddare',
  description: 'Get a random (slightly harder) dare. Usage: .harddare',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    const pick = DARES[Math.floor(Math.random() * DARES.length)];
    await sock.sendMessage(chatId, { text: `🎯 ${pick}` }, { quoted: msg });
  }
};
