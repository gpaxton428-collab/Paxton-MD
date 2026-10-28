import { searchTracks } from '../../lib/api/youtubeFree.js';
import { reply, replyError, usage } from '../../lib/helpers/reply.js';

export default {
  name: 'videosearch',
  alias: ['search', 'vsearch', 'ytsearch'],
  description: 'Search YouTube for videos by keyword. Usage: .search <query>',
  async execute(sock, msg, args, prefix) {
    const query = args.join(' ');
    if (!query) return reply(sock, msg, usage(prefix, 'search <query>', 'search lofi beats'));
    try {
      const items = await searchTracks(query, { limit: 5 });
      const list = items.map((r, i) => `*${i + 1}.* ${r.title}${r.artist ? `\n     👤 ${r.artist}` : ''}${r.duration ? ` · ⏱️ ${r.duration}` : ''}\n     ${r.url}`).join('\n\n');
      await reply(sock, msg, `🔎 *Video results for "${query.slice(0, 50)}"*\n\n${list}`);
    } catch (err) {
      if (err.kind === 'no_results') return reply(sock, msg, `🔎 *No results*\n\nNothing found for "${query.slice(0, 60)}".`);
      await replyError(sock, msg, err, 'search');
    }
  }
};
