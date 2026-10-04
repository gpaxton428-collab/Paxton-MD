export default {
  name: 'randomchoice',
  alias: ['pickone'],
  description: 'Pick a random item from a comma-separated list. Usage: .randomchoice pizza, tacos, sushi',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const items = args.join(' ').split(',').map((i) => i.trim()).filter(Boolean);
    if (items.length < 2) return sock.sendMessage(chatId, { text: '❌ Usage: .randomchoice item1, item2, item3' }, { quoted: msg });
    const pick = items[Math.floor(Math.random() * items.length)];
    await sock.sendMessage(chatId, { text: `🎯 I pick: *${pick}*` }, { quoted: msg });
  }
};
