// /shazam/recognize  /shazam/search  /shazam/track/:id
import { getJson, call } from './wolvarex.js';
import { pickResult, firstString, firstValue } from './normalize.js';
import { AppError, ApiError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

function normalizeSong(item) {
  if (!item || typeof item !== 'object') return null;
  const title = firstString(item, ['title', 'song', 'name']);
  if (!title) return null;
  return {
    title,
    artist: firstString(item, ['artist', 'subtitle', 'author']),
    album: firstString(item, ['album']),
    releaseDate: firstString(item, ['releaseDate', 'release_date', 'year']),
    genre: firstString(item, ['genre', 'genres']),
    cover: firstString(item, ['cover', 'image', 'thumbnail', 'artwork']),
    shazamId: firstValue(item, ['id', 'trackId', 'key'])
  };
}

// Sends a short audio clip and returns the recognised song, or null if nothing matched.
export async function recognizeAudio(buffer) {
  if (!buffer?.length) throw new AppError('No audio to recognize.', { kind: 'invalid_input' });
  const form = new FormData();
  form.append('file', new Blob([buffer]), 'clip.ogg');
  const out = await call('/shazam/recognize', { method: 'POST', form, mode: 'auto', timeoutMs: 30000, retries: 0 });
  if (out.type === 'buffer') throw new ApiError('Unexpected response from Shazam recognize.', { kind: 'bad_response' });
  const song = normalizeSong(pickResult(out.data));
  if (!song) throw new ApiError('No match found for that audio.', { kind: 'no_results' });
  return song;
}

export async function searchShazam(query) {
  const q = String(query || '').trim();
  if (!q) throw new AppError('Please include a search term.', { kind: 'invalid_input' });
  const data = await getJson('/shazam/search', { q });
  const raw = pickResult(data);
  const list = Array.isArray(raw) ? raw : Array.isArray(raw?.tracks) ? raw.tracks : Array.isArray(raw?.hits) ? raw.hits : [];
  const songs = list.map(normalizeSong).filter(Boolean);
  if (!songs.length) throw new ApiError(`No results for "${q}".`, { kind: 'no_results' });
  return songs.slice(0, 5);
}

export async function getShazamTrack(id) {
  if (!/^[\w-]{1,40}$/.test(String(id || ''))) throw new AppError('Invalid Shazam track ID.', { kind: 'invalid_input' });
  const data = await getJson(`/shazam/track/${encodeURIComponent(id)}`);
  const song = normalizeSong(pickResult(data));
  if (!song) { logger.warn('shazam', 'track lookup returned no song'); throw new ApiError('Track not found.', { kind: 'no_results' }); }
  return song;
}
