import { wikiSummary } from '../../lib/api/lookup.js';
import { reply, replyError, usage } from '../../lib/helpers/reply.js';

export default {
  name: 'wiki',
  alias: ['wikipedia'],
  description: 'Get a Wikipedia summary. Usage: .wiki <topic>',
  requires: ['WOLVAREX_API_KEY'],
  async execute(sock, msg, args, prefix) {
    if (!args.length) return reply(sock, msg, usage(prefix, 'wiki <topic>', 'wiki black holes'));
    try {
      const { title, text, url } = await wikiSummary(args.join(' '));
      await reply(sock, msg, `📖 *${title}*\n\n${text}${url ? `\n\n${url}` : ''}`);
    } catch (err) {
      await replyError(sock, msg, err, 'wiki');
    }
  }
};
