import { fetchWithTimeout } from '../../lib/utils/http.js';
import { react, reply, replyError, usage } from '../../lib/helpers/reply.js';

export default {
  name: 'bible',
  alias: ['verse', 'scripture'],
  description: 'Look up a Bible verse. Usage: .bible John 3:16',
  async execute(sock, msg, args, prefix) {
    const ref = args.join(' ').trim();
    if (!ref) return reply(sock, msg, usage(prefix, 'bible <book chapter:verse>', 'bible John 3:16'));
    try {
      await react(sock, msg, '📖');
      const res = await fetchWithTimeout(`https://bible-api.com/${encodeURIComponent(ref)}`, {}, 15000);
      if (res.status === 404) return reply(sock, msg, `❌ Couldn't find "${ref.slice(0, 40)}". Try .bible Psalm 23:1-3`);
      const d = await res.json();
      if (!d.text) return reply(sock, msg, '❌ No verse found.');
      await reply(sock, msg, `📖 *${d.reference}*\n\n${d.text.trim()}\n\n_${d.translation_name || 'Bible'}_`);
    } catch (err) { await replyError(sock, msg, err, 'bible'); }
  }
};
