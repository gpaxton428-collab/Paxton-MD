const BOOKS = ['Dune', '1984', 'The Hobbit', 'Sapiens', 'The Alchemist', 'Atomic Habits', 'Project Hail Mary', 'The Martian'];

export default {
  name: 'bookpick',
  description: 'Get a random book suggestion. Usage: .bookpick',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    const pick = BOOKS[Math.floor(Math.random() * BOOKS.length)];
    await sock.sendMessage(chatId, { text: `📚 Read: *${pick}*` }, { quoted: msg });
  }
};
