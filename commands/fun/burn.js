const LINES = [
  'You have something on your face... oh wait, that\'s just your face.',
  'I\'d agree with you but then we\'d both be wrong.',
  'You bring everyone so much joy... when you leave the room.',
  'Some people graduate with honors, you just graduated with hers and his.',
  'You\'re proof that even evolution takes a day off sometimes.'
];

export default {
  name: 'burn',
  description: 'Get a random playful burn line (all in good fun). Usage: .burn',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    const pick = LINES[Math.floor(Math.random() * LINES.length)];
    await sock.sendMessage(chatId, { text: `🔥 ${pick}` }, { quoted: msg });
  }
};
