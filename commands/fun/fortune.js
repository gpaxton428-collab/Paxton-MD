const FORTUNES = [
  'A pleasant surprise is waiting for you.',
  'Good things come to those who wait — and work.',
  'Your creativity will open new doors soon.',
  'An old friend will bring good news.',
  'Now is a good time to start something new.'
];

export default {
  name: 'fortune',
  description: 'Get a random fortune cookie message. Usage: .fortune',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    const pick = FORTUNES[Math.floor(Math.random() * FORTUNES.length)];
    await sock.sendMessage(chatId, { text: `🥠 ${pick}` }, { quoted: msg });
  }
};
