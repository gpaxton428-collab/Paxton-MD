const MAP = [
  [/hello/gi, 'ahoy'], [/hi\b/gi, 'ahoy'], [/friend/gi, 'matey'], [/my/gi, 'me'],
  [/yes/gi, 'aye'], [/is/gi, "be"], [/you/gi, 'ye'], [/your/gi, 'yer'], [/money/gi, 'booty'], [/stop/gi, 'avast']
];

export default {
  name: 'piratespeak',
  alias: ['pirate'],
  description: 'Translate text into pirate speak. Usage: .piratespeak hello my friend',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    let text = args.join(' ');
    if (!text) return sock.sendMessage(chatId, { text: '❌ Usage: .piratespeak <text>' }, { quoted: msg });
    for (const [pattern, replacement] of MAP) text = text.replace(pattern, replacement);
    await sock.sendMessage(chatId, { text: `🏴‍☠️ ${text}, arrr!` }, { quoted: msg });
  }
};
