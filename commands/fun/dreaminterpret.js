const THEMES = [
  { key: /fly|flying/i, text: 'Dreams of flying often reflect a desire for freedom or rising above a current situation.' },
  { key: /fall|falling/i, text: 'Falling dreams can point to a feeling of losing control over some part of your life.' },
  { key: /teeth/i, text: 'Teeth-related dreams are commonly linked to anxiety about appearance or communication.' },
  { key: /water|ocean|sea/i, text: 'Water often symbolizes emotions — calm water reflects peace, rough water reflects turmoil.' },
  { key: /chase|chasing/i, text: 'Being chased usually reflects avoidance of a problem or person in waking life.' },
  { key: /.*/, text: 'Dreams are highly personal — this one likely reflects something on your mind lately worth sitting with.' }
];
export default {
  name: 'dreaminterpret',
  description: 'Get a lighthearted interpretation of a dream. Usage: .dreaminterpret <describe your dream>',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const text = args.join(' ');
    if (!text) return sock.sendMessage(chatId, { text: '❌ Usage: .dreaminterpret <describe your dream>' }, { quoted: msg });
    const match = THEMES.find((t) => t.key.test(text));
    await sock.sendMessage(chatId, { text: `🌙 *Dream Interpretation*\n${match.text}\n\n_For fun only — not a real dream analyst!_` }, { quoted: msg });
  }
};
