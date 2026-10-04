const ANSWERS = [
  'It is certain.', 'Without a doubt.', 'Yes, definitely.', 'You may rely on it.',
  'Most likely.', 'Outlook good.', 'Signs point to yes.', 'Reply hazy, try again.',
  'Ask again later.', 'Better not tell you now.', 'Cannot predict now.',
  "Don't count on it.", 'My reply is no.', 'Outlook not so good.', 'Very doubtful.'
];
export default {
  name: 'magic8',
  description: 'Ask the magic 8-ball a yes/no question. Usage: .magic8 <question>',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    if (!args.length) return sock.sendMessage(chatId, { text: '❌ Usage: .magic8 <question>' }, { quoted: msg });
    const pick = ANSWERS[Math.floor(Math.random() * ANSWERS.length)];
    await sock.sendMessage(chatId, { text: `🎱 ${pick}` }, { quoted: msg });
  }
};
