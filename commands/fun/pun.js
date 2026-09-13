const PUNS = [
  "I'm reading a book on anti-gravity. It's impossible to put down.",
  "I used to be a banker, but I lost interest.",
  "I only know 25 letters of the alphabet. I don't know y.",
  "A bicycle can't stand on its own because it's two-tired.",
  "I'm on a seafood diet. I see food and I eat it.",
  "Time flies like an arrow. Fruit flies like a banana.",
  "I used to be a baker, but I couldn't make enough dough.",
  "Six was afraid of seven because seven eight nine."
];
export default {
  name: 'pun',
  description: 'Get a random pun. Usage: .pun',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    const pick = PUNS[Math.floor(Math.random() * PUNS.length)];
    await sock.sendMessage(chatId, { text: `😄 ${pick}` }, { quoted: msg });
  }
};
