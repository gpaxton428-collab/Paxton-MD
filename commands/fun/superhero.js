const ADJ = ['Shadow', 'Crimson', 'Iron', 'Blazing', 'Silent', 'Thunder', 'Mystic', 'Solar', 'Frost', 'Phantom'];
const NOUN = ['Falcon', 'Wolf', 'Blade', 'Storm', 'Guardian', 'Viper', 'Titan', 'Phoenix', 'Ranger', 'Ghost'];

export default {
  name: 'superhero',
  alias: ['heroname'],
  description: 'Generate a random superhero name. Usage: .superhero',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    const name = `${ADJ[Math.floor(Math.random() * ADJ.length)]} ${NOUN[Math.floor(Math.random() * NOUN.length)]}`;
    await sock.sendMessage(chatId, { text: `🦸 Your superhero name is: *${name}*` }, { quoted: msg });
  }
};
