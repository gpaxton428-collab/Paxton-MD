import { CATEGORY_META } from '../../lib/menu/categories.js';
import { missingRequirements } from '../../lib/menu/visibility.js';
import { reply } from '../../lib/helpers/reply.js';

export default {
  name: 'cmdinfo',
  alias: ['whatis'],
  description: 'Show details for one command. Usage: .cmdinfo <command name>',
  async execute(sock, msg, args, prefix, ctx) {
    let name = (args[0] || '').toLowerCase();
    if (prefix && name.startsWith(prefix)) name = name.slice(prefix.length);
    if (!name) return reply(sock, msg, `❌ Usage: ${prefix}cmdinfo <command>`);
    const cmd = ctx.commands.get(ctx.commandAliases?.get(name) || name);
    if (!cmd) return reply(sock, msg, `❌ No command named "${name.slice(0, 30)}".`);
    const cat = CATEGORY_META[cmd.category]?.label || cmd.category;
    const missing = missingRequirements(cmd);
    const lines = [
      `✦ *${prefix}${cmd.name}*${cmd.alias?.length ? `  (${cmd.alias.map((a) => `${prefix}${a}`).join(', ')})` : ''}`,
      '', cmd.description || 'No description set.', '',
      `📂 Category: ${cat}`,
      cmd.strictOwner ? '🔒 Owner only (not available to sudo users).' : cmd.ownerOnly ? '🔒 Owner / sudo only.' : null,
      missing.length ? `⚠️ Needs configuration: ${missing.join(', ')}` : null
    ].filter((l) => l !== null);
    await reply(sock, msg, lines.join('\n'));
  }
};
