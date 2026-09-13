const JOKES = [
  "Why don't scientists trust atoms? Because they make up everything.",
  "I used to hate facial hair, but then it grew on me.",
  "What do you call fake spaghetti? An impasta.",
  "Why did the scarecrow win an award? Because he was outstanding in his field.",
  "I'm terrified of elevators, so I'm going to start taking steps to avoid them.",
  "What do you call a fish with no eyes? A fsh."
];
export default {
  name: 'dadjoke',
  description: 'Get a random dad joke. Usage: .dadjoke',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    const pick = JOKES[Math.floor(Math.random() * JOKES.length)];
    await sock.sendMessage(chatId, { text: `👨 ${pick}` }, { quoted: msg });
  }
};
