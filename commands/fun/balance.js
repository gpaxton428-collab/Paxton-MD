import { getUser, xpProgress } from '../../lib/economyStore.js';
import { getTargetJid } from '../../lib/groupHelper.js';

export default {
  name: 'balance',
  alias: ['bal', 'wallet', 'coins'],
  description: 'Check your (or someone\'s) coin balance and level. Usage: .balance [@mention]',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const target = getTargetJid(msg, args) || msg.key.participant || chatId;
    const user = getUser(target);
    const { level, into, need } = xpProgress(target);
    const bar = '▓'.repeat(Math.round((into / need) * 10)).padEnd(10, '░');
    await sock.sendMessage(chatId, {
      text: `💰 *Wallet*\n\n👤 @${target.split('@')[0]}\n🪙 Coins: *${user.coins.toLocaleString()}*\n⭐ Level: *${level}*\n${bar} ${into}/${need} XP`,
      mentions: [target]
    }, { quoted: msg });
  }
};
