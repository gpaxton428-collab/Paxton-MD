const FACTS = [
  'Honey never spoils — archaeologists have found 3000-year-old honey that is still edible.',
  'Octopuses have three hearts.',
  'Bananas are berries, but strawberries are not.',
  'A day on Venus is longer than a year on Venus.',
  'The Eiffel Tower can grow about 15 cm taller in summer due to heat expansion.',
  'Wombat poop is cube-shaped.'
];

export default {
  name: 'fact',
  description: 'Get a random fun fact.',
  async execute(sock, msg) {
    const f = FACTS[Math.floor(Math.random() * FACTS.length)];
    await sock.sendMessage(msg.key.remoteJid, { text: `💡 ${f}` }, { quoted: msg });
  }
};
