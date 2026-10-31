import { fetchWithTimeout } from '../../lib/utils/http.js';
import { react, reply, replyError, usage } from '../../lib/helpers/reply.js';

export default {
  name: 'wikipedia',
  alias: ['wiki'],
  description: 'Short summary of a Wikipedia article. Usage: .wiki <topic>',
  async execute(sock, msg, args, prefix) {
    const q = args.join(' ').trim();
    if (!q) return reply(sock, msg, usage(prefix, 'wiki <topic>', 'wiki Nairobi'));
    try {
      await react(sock, msg, '📚');
      const res = await fetchWithTimeout(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(q.replace(/\s+/g, '_'))}?redirect=true`, { headers: { 'User-Agent': 'PaxtonMD/3 (whatsapp bot)' } }, 15000);
      if (res.status === 404) return reply(sock, msg, `❌ No Wikipedia page for "${q.slice(0, 40)}".`);
      const d = await res.json();
      const text = `📚 *${d.title}*\n${d.description ? `_${d.description}_\n` : ''}\n${(d.extract || 'No summary available.').slice(0, 900)}\n\n🔗 ${d.content_urls?.desktop?.page || ''}`;
      await sock.sendMessage(msg.key.remoteJid, d.thumbnail?.source ? { image: { url: d.thumbnail.source }, caption: text } : { text }, { quoted: msg });
    } catch (err) { await replyError(sock, msg, err, 'wikipedia'); }
  }
};
