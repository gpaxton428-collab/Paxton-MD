const TRUTHS = [
  "What is your biggest fear?",
  "What is the most embarrassing thing you've done?",
  "Who was your first crush?",
  "What is a secret you've never told anyone here?",
  "What's the weirdest dream you've ever had?",
  "What's your biggest regret?"
];

export default {
  name: 'truth',
  description: 'Get a random Truth or Dare "truth" question.',
  async execute(sock, msg) {
    const t = TRUTHS[Math.floor(Math.random() * TRUTHS.length)];
    await sock.sendMessage(msg.key.remoteJid, { text: `🤫 *Truth:* ${t}` }, { quoted: msg });
  }
};
