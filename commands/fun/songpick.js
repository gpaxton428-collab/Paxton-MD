const SONGS = ['Bohemian Rhapsody', 'Blinding Lights', 'Hotel California', 'Uptown Funk', 'Shape of You', 'Levitating', 'Someone Like You'];

export default {
  name: 'songpick',
  description: 'Get a random song suggestion. Usage: .songpick',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    const pick = SONGS[Math.floor(Math.random() * SONGS.length)];
    await sock.sendMessage(chatId, { text: `🎵 Listen to: *${pick}*` }, { quoted: msg });
  }
};
