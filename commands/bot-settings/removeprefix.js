import { replyWithActions } from '../../lib/helpers/actionReply.js';

export default {
  name: 'removeprefix',
  ownerOnly: true,
  description: 'Remove one of several active prefixes (owner only). Usage: .removeprefix !',
  async execute(sock, msg, args, prefix, ctx) {
    const oldPrefix = args[0];
    if (!oldPrefix) return replyWithActions(sock, msg, '❌ Usage: .removeprefix <symbol>', [
      { text: '📌 Prefix Status', id: `${prefix}prefix` },
      { text: '➕ Add !', id: `${prefix}addprefix !` },
      { text: '🏠 Main Menu', id: `${prefix}menu` }
    ]);
    const result = ctx.removePrefixFromList(oldPrefix);
    if (result.success) {
      return replyWithActions(sock, msg,
        `✅ *Prefix Removed*\n\nRemoved: \"${oldPrefix}\"\nActive prefixes: ${result.prefixList.map((p) => `\"${p}\"`).join(', ')}`,
        [
          { text: '📌 Prefix Status', id: `${prefix}prefix` },
          { text: '➕ Add !', id: `${prefix}addprefix !` },
          { text: '🏠 Main Menu', id: `${prefix}menu` }
        ]);
    }
    return replyWithActions(sock, msg, `❌ ${result.error}`, [
      { text: '📌 Prefix Status', id: `${prefix}prefix` },
      { text: '🏠 Main Menu', id: `${prefix}menu` }
    ]);
  }
};
