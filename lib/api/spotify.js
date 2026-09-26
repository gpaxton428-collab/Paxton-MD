// /spotify/album/:id  /spotify/track/:id  /spotify/download
import { getJson, getAuto } from './wolvarex.js';
import { pickResult, findUrl, firstString, firstValue } from './normalize.js';
import { AppError, ApiError } from '../utils/errors.js';
import { downloadBuffer } from '../utils/http.js';
import { logger } from '../utils/logger.js';
import { config } from '../../config/index.js';

const ID_RE = /^[A-Za-z0-9]{10,30}$/;
const TRACK_URL_RE = /^https?:\/\/open\.spotify\.com\/(?:intl-[a-z-]+\/)?track\/([A-Za-z0-9]{10,30})/i;

export function extractSpotifyTrackId(input) {
  const s = String(input || '').trim();
  if (ID_RE.test(s)) return s;
  const m = s.match(TRACK_URL_RE);
  return m ? m[1] : null;
}

function normalizeTrackMeta(item) {
  const raw = pickResult(item);
  if (!raw) return null;
  const title = firstString(raw, ['title', 'name']);
  if (!title) return null;
  const artist = firstString(raw, ['artist', 'artists', 'author']) || (Array.isArray(raw.artists) ? raw.artists.map((a) => a?.name || a).filter(Boolean).join(', ') : undefined);
  return {
    title, artist,
    album: firstString(raw, ['album', 'albumName']) || (typeof raw.album === 'object' ? raw.album?.name : undefined),
    releaseDate: firstString(raw, ['releaseDate', 'release_date']),
    durationMs: firstValue(raw, ['duration_ms', 'durationMs', 'duration']),
    cover: firstString(raw, ['cover', 'image', 'thumbnail', 'albumArt']) || (Array.isArray(raw.images) ? raw.images[0]?.url : undefined)
  };
}

export async function getSpotifyTrack(idOrUrl) {
  const id = extractSpotifyTrackId(idOrUrl);
  if (!id) throw new AppError('That doesn\'t look like a Spotify track ID or link.', { kind: 'invalid_input' });
  const data = await getJson(`/spotify/track/${encodeURIComponent(id)}`);
  const meta = normalizeTrackMeta(data);
  if (!meta) { logger.warn('spotify', 'track lookup returned no metadata'); throw new ApiError('Track not found.', { kind: 'no_results' }); }
  return { id, ...meta };
}

export async function getSpotifyAlbum(idOrUrl) {
  const m = String(idOrUrl || '').match(/^https?:\/\/open\.spotify\.com\/(?:intl-[a-z-]+\/)?album\/([A-Za-z0-9]{10,30})/i);
  const id = m ? m[1] : (ID_RE.test(String(idOrUrl || '').trim()) ? idOrUrl.trim() : null);
  if (!id) throw new AppError('That doesn\'t look like a Spotify album ID or link.', { kind: 'invalid_input' });
  const data = await getJson(`/spotify/album/${encodeURIComponent(id)}`);
  const raw = pickResult(data);
  const name = firstString(raw, ['title', 'name']);
  if (!name) { logger.warn('spotify', 'album lookup returned no metadata'); throw new ApiError('Album not found.', { kind: 'no_results' }); }
  const tracks = Array.isArray(raw?.tracks) ? raw.tracks : Array.isArray(raw?.tracklist) ? raw.tracklist : [];
  return {
    id, name,
    artist: firstString(raw, ['artist', 'artists']),
    releaseDate: firstString(raw, ['releaseDate', 'release_date']),
    cover: firstString(raw, ['cover', 'image', 'thumbnail']),
    trackCount: tracks.length || firstValue(raw, ['trackCount', 'total_tracks']),
    tracks: tracks.slice(0, 20).map((t) => firstString(t, ['title', 'name'])).filter(Boolean)
  };
}

// Downloads audio for a Spotify track URL (the API resolves the actual file via YouTube-style matching).
export async function downloadSpotifyTrack(url, query) {
  if (!/^https?:\/\/open\.spotify\.com\//i.test(String(url || ''))) throw new AppError('Please provide a Spotify track link.', { kind: 'invalid_input' });
  const out = await getAuto('/spotify/download', { url, q: query }, { timeoutMs: config.wolvarex.downloadTimeoutMs, retries: 0 });
  if (out.type === 'buffer') return out.buffer;
  const link = findUrl(pickResult(out.data), { prefer: ['download', 'url', 'result'] });
  if (!link) { logger.warn('spotify', 'download response had no file URL'); throw new ApiError('No downloadable file in response.', { kind: 'bad_response' }); }
  const { buffer } = await downloadBuffer(link, { maxBytes: config.limits.maxAudioMb * 1024 * 1024, timeoutMs: config.wolvarex.downloadTimeoutMs });
  return buffer;
}
