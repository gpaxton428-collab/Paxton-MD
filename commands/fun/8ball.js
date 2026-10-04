const ANSWERS = [
  'Yes, definitely.', 'No way.', 'Ask again later.', 'It is certain.',
  'Very doubtful.', 'Without a doubt.', 'Signs point to yes.', 'Cannot predict now.',
  'My sources say no.', 'Absolutely!', 'Not looking good.', 'Outlook is favorable.'
];

export default {
  name: '8ball',
  description: 'Ask the magic 8-ball a yes/no question. Usage: .8ball Will it rain tomorrow?',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    if (!args.length) return sock.sendMessage(chatId, { text: '❌ Usage: .8ball <question>' }, { quoted: msg });
    const answer = ANSWERS[Math.floor(Math.random() * ANSWERS.length)];
    await sock.sendMessage(chatId, { text: `🎱 ${answer}` }, { quoted: msg });
  }
};
