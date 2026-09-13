const WORDS = 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua'.split(' ');

export default {
  name: 'lorem',
  description: 'Generate placeholder lorem ipsum text. Usage: .lorem 30 (word count)',
  async execute(sock, msg, args) {
    const count = Math.min(parseInt(args[0], 10) || 20, 200);
    const out = [];
    for (let i = 0; i < count; i++) out.push(WORDS[Math.floor(Math.random() * WORDS.length)]);
    const text = out.join(' ');
    await sock.sendMessage(msg.key.remoteJid, { text: text.charAt(0).toUpperCase() + text.slice(1) + '.' }, { quoted: msg });
  }
};
