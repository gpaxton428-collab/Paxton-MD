import { leaderboard } from '../../lib/economyStore.js';

export default {
  name: 'leaderboard',
  alias: ['lb', 'top', 'richest'],
  description: 'Show the top 10 richest users. Usage: .leaderboard [xp]',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const by = (args[0] || '').toLowerCase() === 'xp' ? 'xp' : 'coins';
    const top = leaderboard({ by, limit: 10 });
    if (!top.length) return sock.sendMessage(chatId, { text: 'ℹ️ Nobody has earned any coins yet. Try .daily or .work!' }, { quoted: msg });
    const medals = ['🥇', '🥈', '🥉'];
    const lines = top.map((u, i) => `${medals[i] || `${i + 1}.`} @${u.jid.split('@')[0]} — ${by === 'xp' ? `${u.xp.toLocaleString()} XP (Lv ${u.level})` : `🪙 ${u.coins.toLocaleString()}`}`);
    await sock.sendMessage(chatId, { text: `🏆 *Leaderboard — ${by === 'xp' ? 'Top XP' : 'Richest'}*\n\n${lines.join('\n')}`, mentions: top.map((u) => u.jid) }, { quoted: msg });
  }
};
