import { CATEGORY_META } from '../../lib/menu/categories.js';
import { reply } from '../../lib/helpers/reply.js';

export default {
  name: 'menulist',
  description: 'Show every command category and how many commands it has. Usage: .menulist',
  async execute(sock, msg, args, prefix, ctx) {
    let text = '📋 *Menu List*\n\n';
    for (const [cat, cmds] of ctx.commandCategories.entries()) {
      const m = CATEGORY_META[cat];
      text += `${m ? `${m.icon} ${m.label}` : cat.toUpperCase()}: ${cmds.length}\n`;
    }
    text += `\nTotal: ${ctx.getTotalCommandCount()} commands\nUse *${prefix}menu <category>* to browse one.`;
    await reply(sock, msg, text);
  }
};
