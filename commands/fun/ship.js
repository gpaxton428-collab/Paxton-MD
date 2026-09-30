import { getAllMentionCandidates } from '../../lib/groupHelper.js';

export default {
  name: 'ship',
  description: 'Calculate a fun compatibility score between two people. Reply to/mention one, or mention two.',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const candidates = getAllMentionCandidates(msg, args);
    const sender = msg.key.participant || msg.key.remoteJid;
    const a = candidates[0] || sender;
    const b = candidates[1] || (candidates[0] ? sender : null);
    if (!a || !b) return sock.sendMessage(chatId, { text: '❌ Mention one or two people to ship.' }, { quoted: msg });
    const seed = (a + b).split('').reduce((s, c) => s + c.charCodeAt(0), 0);
    const score = seed % 101;
    const bar = '█'.repeat(Math.round(score / 10)) + '░'.repeat(10 - Math.round(score / 10));
    await sock.sendMessage(chatId, {
      text: `💘 @${a.split('@')[0]} + @${b.split('@')[0]}\n${bar} ${score}%`,
      mentions: [a, b]
    }, { quoted: msg });
  }
};
