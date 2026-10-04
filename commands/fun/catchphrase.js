const PHRASES = [
  "That's what she said.", "Just do it.", "Winter is coming.", "To infinity and beyond!",
  "I'll be back.", "May the odds be ever in your favor.", "Live long and prosper."
];

export default {
  name: 'catchphrase',
  description: 'Get a random famous catchphrase. Usage: .catchphrase',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    const pick = PHRASES[Math.floor(Math.random() * PHRASES.length)];
    await sock.sendMessage(chatId, { text: `🗣️ ${pick}` }, { quoted: msg });
  }
};
