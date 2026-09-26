// Factory for simple "search this, get a short list back" commands
// (.wiki excluded — it gets its own richer command).
import { lookup, summarizeList } from '../api/lookup.js';
import { reply, replyError, usage } from './reply.js';

export function createLookupCommand({ name, kind, alias = [], label, example, titleKeys, detailKeys, limit = 6, emptyNote }) {
  return {
    name, alias,
    description: `Search ${label}. Usage: .${name} <query>`,
    requires: ['WOLVAREX_API_KEY'],
    async execute(sock, msg, args, prefix) {
      if (!args.length) return reply(sock, msg, usage(prefix, `${name} <query>`, example ? `${name} ${example}` : undefined));
      try {
        const raw = await lookup(kind, args.join(' '));
        const lines = summarizeList(raw, { titleKeys, detailKeys, limit });
        await reply(sock, msg, lines.length ? `🔎 *${label}*\n\n${lines.join('\n')}` : (emptyNote || '🔎 No results.'));
      } catch (err) {
        await replyError(sock, msg, err, name);
      }
    }
  };
}
