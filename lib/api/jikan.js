// MyAnimeList lookup through the free Jikan API (no key). Shared by .anime and .manga.
import { fetchWithTimeout } from '../utils/http.js';
import { react, reply, replyError, usage } from '../helpers/reply.js';

export async function sendMal(sock, msg, args, prefix, type) {
  const q = args.join(' ').trim();
  const isManga = type === 'manga';
  if (!q) return reply(sock, msg, usage(prefix, `${type} <title>`, `${type} ${isManga ? 'Berserk' : 'Naruto'}`));
  try {
    await react(sock, msg, '🎌');
    const res = await fetchWithTimeout(`https://api.jikan.moe/v4/${type}?q=${encodeURIComponent(q)}&limit=1&sfw=true`, {}, 20000);
    if (!res.ok) return reply(sock, msg, `❌ Anime service returned ${res.status}. Try again shortly.`);
    const a = (await res.json()).data?.[0];
    if (!a) return reply(sock, msg, `❌ Nothing found for "${q.slice(0, 40)}".`);
    const full = (a.synopsis || 'No synopsis.').replace(/\s+/g, ' ');
    const syn = full.length > 450 ? `${full.slice(0, 450)}…` : full;
    const text = `🎌 *${a.title}*${a.title_japanese ? ` (${a.title_japanese})` : ''}\n\n📺 Type: ${a.type || '—'}\n${isManga ? `📚 Chapters: ${a.chapters ?? '?'}` : `🎞️ Episodes: ${a.episodes ?? '?'}`}\n📌 Status: ${a.status || '—'}\n⭐ Score: ${a.score ?? 'N/A'}\n🏷️ Genres: ${(a.genres || []).map((g) => g.name).join(', ') || '—'}\n\n📝 ${syn}\n\n🔗 ${a.url}`;
    const img = a.images?.jpg?.large_image_url;
    await sock.sendMessage(msg.key.remoteJid, img ? { image: { url: img }, caption: text } : { text }, { quoted: msg });
  } catch (err) { await replyError(sock, msg, err, type); }
}
