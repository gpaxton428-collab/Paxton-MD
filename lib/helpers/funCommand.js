// Factory for the Wolvarex-backed fun commands. API first; if the API is
// unavailable, unconfigured or returns something unrecognisable, the
// command's built-in offline list is used so it never just fails.
import { fetchFun } from '../api/fun.js';
import { isConfigured } from '../api/wolvarex.js';
import { logger } from '../utils/logger.js';
import { reply } from './reply.js';

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

export function createFunCommand({ name, alias, description, kind, icon, title, fallback, format, requiresTarget = false }) {
  return {
    name, alias, description,
    requires: [], // works offline too, so it is always menu-visible
    async execute(sock, msg, args, prefix, ctx) {
      let item = null;
      if (isConfigured()) {
        try { item = await fetchFun(kind); } catch (err) { logger.warn('fun', `${name}: API unavailable (${err.kind || 'error'}), using offline list`); }
      }
      if (!item) {
        const f = pick(fallback);
        item = typeof f === 'string' ? { text: f } : { text: f.q ?? f.text, answer: f.a ?? f.answer, options: f.options };
      }
      const body = format ? format(item) : defaultFormat(item, icon, title);
      return reply(sock, msg, body);
    }
  };
}

export function defaultFormat(item, icon, title) {
  let out = `${icon} ${title ? `*${title}*\n\n` : ''}${item.text}`;
  if (item.options?.length) out += `\n\n${item.options.map((o, i) => `${['🅰️', '🅱️', '🇨', '🇩', '🇪', '🇫'][i] || '•'} ${o}`).join('\n')}`;
  if (item.answer) out += `\n\n_Answer: ${item.answer}_`;
  if (item.author) out += `\n\n— ${item.author}`;
  return out;
}
