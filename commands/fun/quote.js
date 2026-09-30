const QUOTES = [
  "The best way to predict the future is to create it.",
  "Do or do not, there is no try.",
  "Simplicity is the ultimate sophistication.",
  "Success is not final, failure is not fatal: it is the courage to continue that counts.",
  "What you get by achieving your goals is not as important as what you become by achieving your goals.",
  "The only way to do great work is to love what you do.",
  "It always seems impossible until it's done.",
  "Well done is better than well said."
];

export default {
  name: 'quote',
  description: 'Get a random motivational quote.',
  async execute(sock, msg) {
    const q = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    await sock.sendMessage(msg.key.remoteJid, { text: `💬 "${q}"` }, { quoted: msg });
  }
};
