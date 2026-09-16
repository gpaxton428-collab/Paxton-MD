export default {
  name: 'choose',
  alias: ['pick'],
  description: 'Pick one option randomly from a list. Usage: .choose pizza, sushi, tacos',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const options = args.join(' ').split(',').map((o) => o.trim()).filter(Boolean);
    if (options.length < 2) return sock.sendMessage(chatId, { text: '❌ Usage: .choose option1, option2, option3' }, { quoted: msg });
    const picked = options[Math.floor(Math.random() * options.length)];
    await sock.sendMessage(chatId, { text: `🤔 I choose... *${picked}*` }, { quoted: msg });
  }
};
