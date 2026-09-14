const FACTS = [
  'Dogs have about 1,700 taste buds; humans have around 9,000.',
  'A dog\'s sense of smell is up to 100,000 times stronger than a human\'s.',
  'Puppies are born deaf and blind.',
  'Dalmatians are born completely white and develop spots as they age.',
  'Three dogs survived the Titanic sinking.',
  'Dogs\' noses have a unique print, just like human fingerprints.'
];

export default {
  name: 'dogfact',
  description: 'Get a random dog fact. Usage: .dogfact',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    const pick = FACTS[Math.floor(Math.random() * FACTS.length)];
    await sock.sendMessage(chatId, { text: `🐶 ${pick}` }, { quoted: msg });
  }
};
