import { getTargetJid } from '../../lib/groupHelper.js';

export default {
  name: 'addwhitelist',
  alias: ['addsudo'],
  ownerOnly: true,
  strictOwner: true,
  description: 'Give a user sudo (owner-level) access to owner-only commands. Usage: reply to/mention the user with .addsudo',
  async execute(sock, msg, args, currentPrefix, ctx) {
    const chatId = msg.key.remoteJid;
    const target = getTargetJid(msg, args);
    if (!target) return sock.sendMessage(chatId, { text: '❌ Reply to or mention the user to whitelist.' }, { quoted: msg });
    ctx.addToWhitelist(target);
    const displayNumber = ctx?.resolveDisplayNumber ? await ctx.resolveDisplayNumber(target, chatId) : target.split('@')[0];
    await sock.sendMessage(chatId, { text: `✅ Whitelisted @${displayNumber} — they now have sudo (owner-level) access to owner-only commands.`, mentions: [target] }, { quoted: msg });
  }
};
