import { xpProgress } from '../../lib/economyStore.js';
import { leaderboard } from '../../lib/economyStore.js';
import { getTargetJid } from '../../lib/groupHelper.js';

export default {
  name: 'rank',
  alias: ['level', 'xp'],
  description: 'Show your (or someone\'s) level, XP and leaderboard position. Usage: .rank [@mention]',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const target = getTargetJid(msg, args) || msg.key.participant || chatId;
    const { level, into, need } = xpProgress(target);
    const board = leaderboard({ by: 'xp', limit: 100000 });
    const position = board.findIndex((u) => u.jid === target) + 1;
    const bar = '▓'.repeat(Math.round((into / need) * 10)).padEnd(10, '░');
    await sock.sendMessage(chatId, {
      text: `📊 *Rank Card*\n\n👤 @${target.split('@')[0]}\n⭐ Level: *${level}*\n${bar} ${into}/${need} XP\n🏅 Position: *#${position || '—'}*`,
      mentions: [target]
    }, { quoted: msg });
  }
};
