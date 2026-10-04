const FACTS = [
  'Cats sleep for around 12-16 hours a day.',
  'A group of cats is called a clowder.',
  'Cats can rotate their ears 180 degrees.',
  'A cat\'s nose print is unique, just like a human fingerprint.',
  'Cats have five toes on their front paws but only four on the back.',
  'Cats can jump up to six times their length.'
];

export default {
  name: 'catfact',
  description: 'Get a random cat fact. Usage: .catfact',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    const pick = FACTS[Math.floor(Math.random() * FACTS.length)];
    await sock.sendMessage(chatId, { text: `🐱 ${pick}` }, { quoted: msg });
  }
};
