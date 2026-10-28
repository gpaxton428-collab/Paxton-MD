// Free YouTube search + audio download — no API key, no Wolvarex.
// Search: youtube-sr (scrapes YouTube's own search page, same approach
// most no-key WhatsApp bots use). Download: @distube/ytdl-core, an
// actively-maintained ytdl-core fork.
//
// Trade-off worth knowing: unlike a paid API, a scraper like this can
// break whenever YouTube changes its page markup, and there's no SLA
// or support contract behind it. It's free and key-less, not
// maintenance-free — if .play or .songs suddenly stop working, it's
// usually because one of these two packages needs a version bump.
import { AppError } from '../utils/errors.js';

const YT_ID = /(?:v=|youtu\.be\/|\/shorts\/|\/embed\/)([\w-]{11})/;
const BARE_ID = /^[\w-]{11}$/;
export function extractVideoId(input) {
  const s = String(input || '').trim();
  const m = s.match(YT_ID);
  if (m) return m[1];
  return BARE_ID.test(s) ? s : null;
}
import { formatClock } from '../utils/format.js';
import { config } from '../../config/index.js';

let YouTube, ytdl;
async function backends() {
  if (!YouTube) YouTube = (await import('youtube-sr')).default;
  if (!ytdl) ytdl = (await import('@distube/ytdl-core')).default;
  return { YouTube, ytdl };
}

function normalize(v) {
  return {
    id: v.id,
    title: v.title || 'Unknown title',
    artist: v.channel?.name,
    durationSeconds: v.duration ? Math.floor(v.duration / 1000) : undefined,
    duration: v.duration ? formatClock(Math.floor(v.duration / 1000)) : v.durationFormatted,
    thumbnail: v.thumbnail?.url,
    url: v.url || `https://www.youtube.com/watch?v=${v.id}`
  };
}

export async function searchTracks(query, { limit = 5 } = {}) {
  const q = String(query || '').trim();
  if (!q) throw new AppError('Please type a song name.', { kind: 'invalid_input' });
  if (q.length > 120) throw new AppError('That search is too long (max 120 characters).', { kind: 'invalid_input' });
  const { YouTube } = await backends();
  const results = await YouTube.search(q, { limit, type: 'video' }).catch(() => []);
  const tracks = results.map(normalize).filter((t) => t.id).slice(0, limit);
  if (!tracks.length) throw new AppError('No results', { kind: 'no_results' });
  return tracks;
}

export async function getAudioBuffer(idOrUrl, { maxBytes } = {}) {
  const { ytdl } = await backends();
  const url = /^https?:\/\//i.test(idOrUrl) ? idOrUrl : `https://www.youtube.com/watch?v=${idOrUrl}`;
  if (!ytdl.validateURL(url)) throw new AppError('That is not a valid YouTube video id or link.', { kind: 'invalid_input' });
  const limit = maxBytes || config.limits.maxAudioMb * 1024 * 1024;
  return new Promise((resolve, reject) => {
    const chunks = [];
    let total = 0;
    const stream = ytdl(url, { filter: 'audioonly', quality: 'highestaudio', highWaterMark: 1 << 25 });
    stream.on('data', (chunk) => {
      total += chunk.length;
      if (total > limit) { stream.destroy(); reject(new AppError('That audio is too large to send.', { kind: 'too_large' })); return; }
      chunks.push(chunk);
    });
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', (err) => reject(new AppError(`Download failed: ${err.message}`, { kind: 'bad_response' })));
  });
}

export const maxAudioSeconds = () => config.limits.maxAudioMinutes * 60;
