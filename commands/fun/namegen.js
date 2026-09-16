const FIRST = ['Thal', 'Kor', 'Elin', 'Bran', 'Zora', 'Fen', 'Mira', 'Drav', 'Syl', 'Orin'];
const LAST = ['dor', 'wyn', 'thas', 'mir', 'ric', 'lin', 'ven', 'gard', 'iel', 'mond'];

export default {
  name: 'namegen',
  alias: ['fantasyname'],
  description: 'Generate a random fantasy character name. Usage: .namegen',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    const name = FIRST[Math.floor(Math.random() * FIRST.length)] + LAST[Math.floor(Math.random() * LAST.length)];
    await sock.sendMessage(chatId, { text: `📜 Your fantasy name: *${name}*` }, { quoted: msg });
  }
};
