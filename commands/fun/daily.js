import { claimDaily, formatCooldown } from '../../lib/economyStore.js';

export default {
  name: 'daily',
  description: 'Claim your daily coin reward (once every 24h). Usage: .daily',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    const sender = msg.key.participant || chatId;
    const result = claimDaily(sender);
    if (!result.ok) {
      return sock.sendMessage(chatId, { text: `⏳ You already claimed today's reward. Come back in *${formatCooldown(result.remaining)}*.` }, { quoted: msg });
    }
    await sock.sendMessage(chatId, { text: `🎁 *Daily reward claimed!*\n\n+🪙 ${result.reward} coins\nBalance: *${result.coins.toLocaleString()}* coins` }, { quoted: msg });
  }
};
