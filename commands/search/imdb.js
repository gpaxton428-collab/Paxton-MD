import { fetchWithTimeout } from '../../lib/utils/http.js';
import { react, reply, replyError, usage } from '../../lib/helpers/reply.js';

export default {
  name: 'imdb',
  alias: ['movie', 'imdbsearch'],
  description: 'Search movies and shows on IMDb. Usage: .imdb <title>',
  async execute(sock, msg, args, prefix) {
    const q = args.join(' ').trim();
    if (!q) return reply(sock, msg, usage(prefix, 'imdb <title>', 'imdb Inception'));
    try {
      await react(sock, msg, '🎬');
      const first = q[0].toLowerCase().match(/[a-z0-9]/) ? q[0].toLowerCase() : 'x';
      const res = await fetchWithTimeout(`https://v3.sg.media-imdb.com/suggestion/${first}/${encodeURIComponent(q)}.json`, { headers: { 'User-Agent': 'Mozilla/5.0 PaxtonMD' } }, 15000);
      const d = await res.json();
      const hits = (d.d || []).filter((x) => x.id?.startsWith('tt')).slice(0, 5);
      if (!hits.length) return reply(sock, msg, `❌ Nothing found for "${q.slice(0, 40)}".`);
      const top = hits[0];
      const text = `🎬 *IMDb results for "${q.slice(0, 40)}"*\n\n${hits.map((h, i) => `${i + 1}. *${h.l}* ${h.y ? `(${h.y})` : ''}${h.q ? ` · ${h.q}` : ''}\n   ${h.s ? `⭐ ${h.s}\n   ` : ''}🔗 https://www.imdb.com/title/${h.id}/`).join('\n\n')}`;
      await sock.sendMessage(msg.key.remoteJid, top.i?.imageUrl ? { image: { url: top.i.imageUrl }, caption: text } : { text }, { quoted: msg });
    } catch (err) { await replyError(sock, msg, err, 'imdb'); }
  }
};
