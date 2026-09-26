import { searchVideos } from '../../lib/api/tools.js';
import { reply, replyError, usage } from '../../lib/helpers/reply.js';

export default {
  name: 'videosearch',
  alias: ['search', 'vsearch', 'ytsearch'],
  description: 'Search for videos by keyword. Usage: .search <query>',
  requires: ['WOLVAREX_API_KEY'],
  async execute(sock, msg, args, prefix) {
    const query = args.join(' ');
    if (!query) return reply(sock, msg, usage(prefix, 'search <query>', 'search lofi beats'));
    try {
      const items = await searchVideos(query);
      const list = items.map((r, i) => `*${i + 1}.* ${r.title}${r.channel ? `\n     👤 ${r.channel}` : ''}${r.duration ? ` · ⏱️ ${r.duration}` : ''}${r.url ? `\n     ${r.url}` : ''}`).join('\n\n');
      await reply(sock, msg, `🔎 *Video results for "${query.slice(0, 50)}"*\n\n${list}`);
    } catch (err) {
      if (err.kind === 'no_results') return reply(sock, msg, `🔎 *No results*\n\nNothing found for "${query.slice(0, 60)}".`);
      await replyError(sock, msg, err, 'search');
    }
  }
};
