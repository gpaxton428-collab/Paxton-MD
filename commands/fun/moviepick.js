const MOVIES = ['Inception', 'The Matrix', 'Interstellar', 'Spirited Away', 'The Dark Knight', 'Parasite', 'Whiplash', 'La La Land'];

export default {
  name: 'moviepick',
  description: 'Get a random movie suggestion. Usage: .moviepick',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    const pick = MOVIES[Math.floor(Math.random() * MOVIES.length)];
    await sock.sendMessage(chatId, { text: `🎬 Watch: *${pick}*` }, { quoted: msg });
  }
};
