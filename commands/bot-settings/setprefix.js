import { replyWithActions } from '../../lib/helpers/actionReply.js';

export default {
  name: 'setprefix',
  ownerOnly: true,
  description: "Change the bot's command prefix (owner only). Usage: .setprefix ! (or 'none' for no prefix)",
  async execute(sock, msg, args, prefix, ctx) {
    const chatId = msg.key.remoteJid;
    const newPrefix = args[0];
    if (!newPrefix) return replyWithActions(sock, msg, '❌ Usage: .setprefix <symbol> (or none)', [
      { text: '📌 Prefix Status', id: `${prefix}prefix` },
      { text: '➕ Add Prefix', id: `${prefix}addprefix !` },
      { text: '🏠 Main Menu', id: `${prefix}menu` }
    ]);
    const result = ctx.updatePrefix(newPrefix);
    if (result.success) {
      const active = ctx.getPrefixList ? ctx.getPrefixList() : [result.newPrefix].filter(Boolean);
      return replyWithActions(sock, msg,
        `✅ *Prefix Updated*\n\nNew prefix: ${result.isPrefixless ? 'none (prefixless)' : `\"${result.newPrefix}\"`}\nActive: ${result.isPrefixless ? 'none' : active.map((p) => `\"${p}\"`).join(', ')}`,
        [
          { text: '📌 Prefix Status', id: `${result.isPrefixless ? '' : result.newPrefix}prefix` },
          { text: '➕ Add !', id: `${result.isPrefixless ? '' : result.newPrefix}addprefix !` },
          { text: '🏠 Main Menu', id: `${result.isPrefixless ? '' : result.newPrefix}menu` }
        ]);
    }
    return replyWithActions(sock, msg, `❌ ${result.error}`, [
      { text: '📌 Prefix Status', id: `${prefix}prefix` },
      { text: '🏠 Main Menu', id: `${prefix}menu` }
    ]);
  }
};
