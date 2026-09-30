const DARES = [
  "Send the last photo in your gallery.",
  "Text your crush 'hi' right now.",
  "Speak in an accent for the next 5 messages.",
  "Do 10 pushups and send a video.",
  "Let the group pick your WhatsApp status for a day.",
  "Post an embarrassing childhood story."
];

export default {
  name: 'dare',
  description: 'Get a random Truth or Dare "dare" challenge.',
  async execute(sock, msg) {
    const d = DARES[Math.floor(Math.random() * DARES.length)];
    await sock.sendMessage(msg.key.remoteJid, { text: `🔥 *Dare:* ${d}` }, { quoted: msg });
  }
};
