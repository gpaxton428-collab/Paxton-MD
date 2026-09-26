// /music/ytmp3-search  and  /music/ytmp3-download
import { getJson } from './wolvarex.js';
import { extractList, findUrl, firstString, firstValue, pickResult, summarizeShape } from './normalize.js';
import { AppError, ApiError } from '../utils/errors.js';
import { parseDurationToSeconds, formatClock } from '../utils/format.js';
import { logger } from '../utils/logger.js';
import { config } from '../../config/index.js';

const YT_ID = /(?:v=|youtu\.be\/|\/shorts\/|\/embed\/)([\w-]{11})/;
const BARE_ID = /^[\w-]{11}$/;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function extractVideoId(input) {
  const s = String(input || '').trim();
  const m = s.match(YT_ID);
  if (m) return m[1];
  return BARE_ID.test(s) ? s : null;
}

export function normalizeTrack(item) {
  if (!item || typeof item !== 'object') return null;
  const url = firstString(item, ['url', 'link', 'videoUrl', 'video_url']);
  const id = firstString(item, ['id', 'videoId', 'video_id', 'vid', 'v']) || (url && extractVideoId(url)) || null;
  if (!id) return null;
  const author = item.author ?? item.channel ?? item.uploader ?? item.artist ?? item.channelTitle;
  const artist = typeof author === 'string' ? author : author?.name || author?.title || undefined;
  const rawDuration = firstValue(item, ['seconds', 'duration_seconds', 'timestamp', 'duration', 'duration_formatted', 'length']);
  const durationSeconds = parseDurationToSeconds(rawDuration?.seconds ?? rawDuration);
  let thumbnail = firstString(item, ['thumbnail', 'thumb', 'image', 'cover', 'thumbnailUrl', 'thumbnail_url']);
  if (!thumbnail && Array.isArray(item.thumbnails)) thumbnail = item.thumbnails.map((t) => (typeof t === 'string' ? t : t?.url)).find(Boolean);
  const views = firstValue(item, ['views', 'viewCount', 'view_count', 'plays']);
  const releaseDate = firstString(item, ['releaseDate', 'release_date', 'uploadDate', 'upload_date', 'publishedAt', 'published_at', 'date']);
  return {
    id,
    title: firstString(item, ['title', 'name']) || 'Unknown title',
    artist,
    durationSeconds,
    duration: durationSeconds != null ? formatClock(durationSeconds) : (typeof rawDuration === 'string' ? rawDuration : undefined),
    thumbnail: thumbnail && /^https?:\/\//i.test(thumbnail) ? thumbnail : undefined,
    views: formatViews(views),
    releaseDate: releaseDate ? String(releaseDate).slice(0, 40) : undefined,
    url: url || `https://www.youtube.com/watch?v=${id}`
  };
}

// "1234567" / 1234567 -> "1.2M views". Leaves already-formatted strings (e.g. "1.2M") alone.
function formatViews(v) {
  if (v === undefined || v === null || v === '') return undefined;
  const n = typeof v === 'number' ? v : (/^[\d,]+$/.test(String(v).trim()) ? Number(String(v).replace(/,/g, '')) : NaN);
  if (!Number.isFinite(n)) return String(v).trim();
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B views`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M views`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K views`;
  return `${n} views`;
}

export async function searchTracks(query, { limit = 5 } = {}) {
  const q = String(query || '').replace(/[\u0000-\u001f]/g, ' ').trim();
  if (!q) throw new AppError('Please type a song name.', { kind: 'invalid_input' });
  if (q.length > 120) throw new AppError('That search is too long (max 120 characters).', { kind: 'invalid_input' });
  const data = await getJson('/music/ytmp3-search', { q, provider: 'ytmp3' });
  let list = extractList(data);
  if (!list.length) { const single = pickResult(data); if (single && typeof single === 'object' && !Array.isArray(single)) list = [single]; }
  const tracks = list.map(normalizeTrack).filter(Boolean).slice(0, limit);
  if (!tracks.length) {
    if (list.length) logger.warn('music', 'Search returned items but none had a usable id', summarizeShape(data));
    throw new AppError('No results', { kind: 'no_results' });
  }
  return tracks;
}

const PENDING = /^(processing|pending|queued|converting|working)$/i;

export async function getTrackDownload(id) {
  if (!extractVideoId(id)) throw new AppError('That is not a valid YouTube video id or link.', { kind: 'invalid_input' });
  const vid = extractVideoId(id);
  for (let attempt = 0; attempt < 3; attempt++) {
    const data = await getJson('/music/ytmp3-download', { id: vid, provider: 'ytmp3' }, { timeoutMs: 60000 });
    const url = findUrl(pickResult(data));
    if (url) {
      const node = pickResult(data);
      const meta = node && typeof node === 'object' && !Array.isArray(node) ? normalizeMeta(node) : {};
      return { url, ...meta };
    }
    const status = firstString(data, ['status']) || firstString(pickResult(data), ['status', 'state']);
    if (status && PENDING.test(status) && attempt < 2) { await sleep(3500); continue; }
    logger.warn('music', 'Download response had no URL', summarizeShape(data));
    throw new ApiError('No download URL in response', { kind: 'bad_response' });
  }
  throw new ApiError('Download still pending', { kind: 'timeout' });
}

function normalizeMeta(node) {
  const t = normalizeTrack({ id: 'xxxxxxxxxxx', ...node });
  return t ? { title: node.title || node.name ? t.title : undefined, thumbnail: t.thumbnail, durationSeconds: t.durationSeconds } : {};
}

export const maxAudioSeconds = () => config.limits.maxAudioMinutes * 60;
