import { claimWork, addXp, formatCooldown } from '../../lib/economyStore.js';

const JOBS = [
  'fixed a bug in production', 'delivered pizzas across town', 'walked three dogs at once',
  'moderated a group chat all day', 'wrote a bot command', 'sold lemonade on the corner',
  'tutored a neighbor in math', 'fixed someone\'s wifi', 'designed a logo',
  'repaired a bicycle', 'babysat a very loud toddler',
];

export default {
  name: 'work',
  description: 'Work a quick job for coins (once an hour). Usage: .work',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    const sender = msg.key.participant || chatId;
    const result = claimWork(sender);
    if (!result.ok) {
      return sock.sendMessage(chatId, { text: `⏳ You're still tired from your last shift. Try again in *${formatCooldown(result.remaining)}*.` }, { quoted: msg });
    }
    const job = JOBS[Math.floor(Math.random() * JOBS.length)];
    const { leveledUp, level } = addXp(sender, 10 + Math.floor(Math.random() * 15));
    let text = `💼 You ${job} and earned *🪙 ${result.reward}* coins!\nBalance: *${result.coins.toLocaleString()}* coins`;
    if (leveledUp) text += `\n\n🎉 *Level up!* You're now level *${level}*.`;
    await sock.sendMessage(chatId, { text }, { quoted: msg });
  }
};
