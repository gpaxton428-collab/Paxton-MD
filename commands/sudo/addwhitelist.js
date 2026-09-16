import { getTargetJid } from '../../lib/groupHelper.js';

export default {
  name: 'addwhitelist',
  alias: ['addsudo'],
  ownerOnly: true,
  description: 'Give a user sudo (owner-level) access to owner-only commands. Usage: reply to/mention the user with .addsudo',
  async execute(sock, msg, args, currentPrefix, ctx) {
    const chatId = msg.key.remoteJid;
    const target = getTargetJid(msg, args);
    if (!target) return sock.sendMessage(chatId, { text: '❌ Reply to or mention the user to whitelist.' }, { quoted: msg });
    ctx.addToWhitelist(target);
    await sock.sendMessage(chatId, { text: `✅ Whitelisted @${target.split('@')[0]} — they now have sudo (owner-level) access to owner-only commands.`, mentions: [target] }, { quoted: msg });
  }
};
