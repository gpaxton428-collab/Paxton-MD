import { replyWithActions } from '../../lib/helpers/actionReply.js';

export default {
  name: 'addprefix',
  ownerOnly: true,
  description: 'Add an extra active prefix without replacing existing ones (owner only). Usage: .addprefix !',
  async execute(sock, msg, args, prefix, ctx) {
    const newPrefix = args[0];
    if (!newPrefix) return replyWithActions(sock, msg, '❌ Usage: .addprefix <symbol>', [
      { text: '📌 Prefix Status', id: `${prefix}prefix` },
      { text: '➕ Add !', id: `${prefix}addprefix !` },
      { text: '🏠 Main Menu', id: `${prefix}menu` }
    ]);
    const result = ctx.addPrefixToList(newPrefix);
    if (result.success) {
      return replyWithActions(sock, msg,
        `✅ *Prefix Added*\n\nAdded: \"${newPrefix}\"\nActive prefixes: ${result.prefixList.map((p) => `\"${p}\"`).join(', ')}`,
        [
          { text: '📌 Prefix Status', id: `${prefix}prefix` },
          { text: `🗑️ Remove ${newPrefix}`, id: `${prefix}removeprefix ${newPrefix}` },
          { text: '🏠 Main Menu', id: `${prefix}menu` }
        ]);
    }
    return replyWithActions(sock, msg, `❌ ${result.error}`, [
      { text: '📌 Prefix Status', id: `${prefix}prefix` },
      { text: '🏠 Main Menu', id: `${prefix}menu` }
    ]);
  }
};
