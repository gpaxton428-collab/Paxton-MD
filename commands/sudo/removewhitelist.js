import { getTargetJid } from '../../lib/groupHelper.js';

export default {
  name: 'removewhitelist',
  alias: ['removesudo', 'delsudo'],
  ownerOnly: true,
  strictOwner: true,
  description: 'Remove sudo (owner-level) access from a user. Usage: reply to/mention the user with .delsudo',
  async execute(sock, msg, args, currentPrefix, ctx) {
    const chatId = msg.key.remoteJid;
    const target = getTargetJid(msg, args);
    if (!target) return sock.sendMessage(chatId, { text: '❌ Reply to or mention the user to remove.' }, { quoted: msg });
    ctx.removeFromWhitelist(target);
    const displayNumber = ctx?.resolveDisplayNumber ? await ctx.resolveDisplayNumber(target, chatId) : target.split('@')[0];
    await sock.sendMessage(chatId, { text: `✅ Removed @${displayNumber} from the whitelist.`, mentions: [target] }, { quoted: msg });
  }
};
