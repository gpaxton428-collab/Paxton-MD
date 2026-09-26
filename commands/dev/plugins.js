import { missingRequirements } from '../../lib/menu/visibility.js';
import { reply } from '../../lib/helpers/reply.js';

export default {
  name: 'plugins',
  alias: ['pluginlist'],
  ownerOnly: true,
  description: 'List loaded plugins by category with load problems. Usage: .plugins [category|failed|search <name>]',
  async execute(sock, msg, args, prefix, ctx) {
    const report = ctx.pluginReport || { loaded: 0, failed: [], duplicates: [], aliasConflicts: [] };
    const sub = (args[0] || '').toLowerCase();

    if (sub === 'failed') {
      if (!report.failed.length && !report.duplicates.length && !report.aliasConflicts.length) return reply(sock, msg, '✅ Every plugin loaded cleanly.');
      const out = ['⚠️ *Plugin problems*'];
      report.failed.forEach((f) => out.push(`• ❌ ${f.file}: ${f.error}`));
      report.duplicates.forEach((d) => out.push(`• ♻️ duplicate "${d.name}" in ${d.skipped} (kept ${d.kept})`));
      report.aliasConflicts.forEach((a) => out.push(`• 🔀 alias "${a.alias}" for ${a.command}: ${a.reason}`));
      return reply(sock, msg, out.join('\n'));
    }

    if (sub === 'search' && args[1]) {
      const q = args[1].toLowerCase();
      const hits = [...ctx.commands.values()].filter((c) => c.name.includes(q) || (c.alias || []).some((a) => a.includes(q)));
      return reply(sock, msg, hits.length ? hits.slice(0, 25).map((c) => `• ${prefix}${c.name} — ${c.category} (${ctx.commandMeta?.get(c.name.toLowerCase())?.file || '?'})`).join('\n') : '🔎 No plugin matches that.');
    }

    if (sub && ctx.commandCategories.has(sub)) {
      const names = ctx.commandCategories.get(sub);
      return reply(sock, msg, `📦 *${sub}* (${names.length})\n${names.map((n) => `${prefix}${n}${missingRequirements(ctx.commands.get(n.toLowerCase())).length ? ' ⚠️' : ''}`).join('  ')}`);
    }

    const lines = ['📦 *Plugins*', ''];
    for (const [cat, names] of ctx.commandCategories) lines.push(`• ${cat}: ${names.length}`);
    const needsKey = [...ctx.commands.values()].filter((c) => missingRequirements(c).length).length;
    lines.push('', `Total: ${ctx.getTotalCommandCount()} · aliases: ${ctx.commandAliases.size} · load time: ${report.durationMs ?? '?'} ms`);
    lines.push(`Problems: ${report.failed.length + report.duplicates.length + report.aliasConflicts.length}${needsKey ? ` · waiting for an API key: ${needsKey} ⚠️` : ''}`);
    lines.push('', `${prefix}plugins <category> · ${prefix}plugins failed · ${prefix}plugins search <name>`);
    await reply(sock, msg, lines.join('\n'));
  }
};
