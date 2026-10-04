const ANIMALS = ['Wolf', 'Owl', 'Fox', 'Bear', 'Eagle', 'Dolphin', 'Lion', 'Raven', 'Otter', 'Tiger', 'Deer', 'Snake'];
export default {
  name: 'animalspirit',
  description: 'Discover your spirit animal for today. Usage: .animalspirit',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    const pick = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
    await sock.sendMessage(chatId, { text: `🐾 Your spirit animal today is: *${pick}*` }, { quoted: msg });
  }
};
