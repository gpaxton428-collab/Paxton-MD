const LINES = [
  "Are you a magician? Because whenever I look at you, everyone else disappears.",
  "Do you have a map? I keep getting lost in your eyes.",
  "Is it hot in here, or is it just you?",
  "If I could rearrange the alphabet, I'd put U and I together.",
  "You must be tired, because you've been running through my mind all day."
];
export default {
  name: 'flirtline',
  description: 'Get a random cheesy pickup line. Usage: .flirtline',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    const pick = LINES[Math.floor(Math.random() * LINES.length)];
    await sock.sendMessage(chatId, { text: `😏 ${pick}` }, { quoted: msg });
  }
};
