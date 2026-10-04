const TEMPLATES = [
  '{w}. Because you deserve it.',
  'The future of {w} is here.',
  "{w} — it's more than a name.",
  'Live the {w} life.',
  '{w}: simply better.',
  "Once you {w}, you never go back."
];

export default {
  name: 'slogan',
  description: 'Generate a slogan for a word/brand. Usage: .slogan Paxton',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const word = args.join(' ');
    if (!word) return sock.sendMessage(chatId, { text: '❌ Usage: .slogan <word>' }, { quoted: msg });
    const template = TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)];
    await sock.sendMessage(chatId, { text: `📢 ${template.replace(/\{w\}/g, word)}` }, { quoted: msg });
  }
};
