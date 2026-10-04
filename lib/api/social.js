// /download/instagram/igram
import { getJson } from './wolvarex.js';
import { pickResult, summarizeShape } from './normalize.js';
import { ApiError, AppError } from '../utils/errors.js';
import { assertPublicHttpUrl } from '../utils/urlSafety.js';
import { logger } from '../utils/logger.js';

export const IG_HOSTS = ['instagram.com', 'instagr.am'];
export const TIKTOK_HOSTS = ['tiktok.com'];

export async function validateSocialUrl(url, hosts) {
  try { return await assertPublicHttpUrl(url, { allowedHosts: hosts, resolveDns: false }); }
  catch { throw new AppError(`That doesn't look like a valid ${hosts[0].split('.')[0]} link.`, { kind: 'invalid_input' }); }
}

const isHttp = (s) => typeof s === 'string' && /^https?:\/\//i.test(s);
const typeOf = (url, hint) => {
  if (/video|reel/i.test(String(hint || ''))) return 'video';
  if (/image|photo|jpg|jpeg|png|webp/i.test(String(hint || ''))) return 'image';
  return /\.(mp4|mov|webm)(\?|$)/i.test(url) ? 'video' : /\.(jpe?g|png|webp)(\?|$)/i.test(url) ? 'image' : 'video';
};

function collect(node, out, depth = 0) {
  if (!node || depth > 4) return;
  if (typeof node === 'string') { if (isHttp(node)) out.push({ url: node, type: typeOf(node) }); return; }
  if (Array.isArray(node)) { node.forEach((n) => collect(n, out, depth + 1)); return; }
  if (typeof node === 'object') {
    const direct = ['url', 'download', 'downloadUrl', 'download_url', 'video', 'image', 'src'].find((k) => isHttp(node[k]));
    if (direct) { out.push({ url: node[direct], type: typeOf(node[direct], node.type || direct) }); return; }
    for (const k of ['media', 'medias', 'links', 'urls', 'items', 'result', 'data', 'videos', 'images']) if (node[k]) collect(node[k], out, depth + 1);
  }
}

export async function getInstagramMedia(url) {
  const safe = await validateSocialUrl(url, IG_HOSTS);
  const data = await getJson('/download/instagram/igram', { url: safe }, { timeoutMs: 45000 });
  const found = [];
  collect(pickResult(data), found);
  const seen = new Set();
  const media = found.filter((m) => !seen.has(m.url) && seen.add(m.url)).slice(0, 5);
  if (!media.length) { logger.warn('instagram', 'No media in response', summarizeShape(data)); throw new ApiError('No media found', { kind: 'no_results' }); }
  return media;
}
