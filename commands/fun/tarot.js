const CARDS = [
  'The Fool — new beginnings await.', 'The Sun — good things are coming.',
  'The Tower — expect sudden change.', 'The Star — hope and renewal.',
  'The Moon — trust your intuition.', 'The Wheel of Fortune — luck is turning.',
  'The Lovers — a big decision is near.', 'Death — an ending, and a fresh start.'
];
export default {
  name: 'tarot',
  description: 'Draw a random tarot card. Usage: .tarot',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    const pick = CARDS[Math.floor(Math.random() * CARDS.length)];
    await sock.sendMessage(chatId, { text: `🔮 *Tarot Draw*\n${pick}\n\n_For fun only!_` }, { quoted: msg });
  }
};
