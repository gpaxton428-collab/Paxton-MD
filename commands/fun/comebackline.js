const LINES = [
  "I'd agree with you, but then we'd both be wrong.",
  "I'm not saying you're wrong, I'm just saying I've never seen you be right.",
  "You bring everyone so much joy... when you leave the room.",
  "I'm sorry, I don't speak nonsense.",
  "That's a great story — tell it in silence next time."
];
export default {
  name: 'comebackline',
  description: 'Get a random witty comeback line. Usage: .comebackline',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    const pick = LINES[Math.floor(Math.random() * LINES.length)];
    await sock.sendMessage(chatId, { text: `😏 ${pick}` }, { quoted: msg });
  }
};
