import { replyWithActions } from '../../lib/helpers/actionReply.js';

export default {
  name: 'prefix',
  alias: ['getprefix'],
  description: 'Show the current and active command prefixes. Usage: .prefix',
  async execute(sock, msg, args, currentPrefix, ctx) {
    const active = ctx.getPrefixList ? ctx.getPrefixList() : (ctx.isPrefixless ? [] : [currentPrefix]);
    const text = [
      '╭━━━〔 ⚙️ PREFIX CONTROL 〕━━━┈⊷',
      '│',
      `│ 🔹 Primary : ${ctx.isPrefixless ? 'none' : `\"${currentPrefix}\"`}`,
      `│ 🔹 Active  : ${active.length ? active.map((p) => `\"${p}\"`).join(', ') : 'none'}`,
      `│ 🔹 Mode    : ${ctx.isPrefixless ? 'PREFIXLESS' : 'PREFIXED'}`,
      '│',
      '╰━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷'
    ].join('\n');
    const p = ctx.isPrefixless ? '' : currentPrefix;
    return replyWithActions(sock, msg, text, [
      { text: '➕ Add !', id: `${p}addprefix !` },
      { text: '📌 Set !', id: `${p}setprefix !` },
      { text: '🏠 Main Menu', id: `${p}menu` }
    ]);
  }
};
