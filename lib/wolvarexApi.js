// Thin wrapper around apix.wolvarex.com — a third-party API aggregator
// (AI passthrough, media conversion, downloaders, search, weather).
// This is the user's own API key; nothing here is Anthropic's.
import { API_KEYS, hasKey } from '../api/keys.js';

const BASE = 'https://apix.wolvarex.com/api';

export function wolvarexConfigured() {
  return hasKey('WOLVAREX_API_KEY');
}

// Builds a full request URL with the key attached. `params` values are
// URL-encoded automatically — callers pass raw strings/URLs, not
// pre-encoded ones.
function buildUrl(path, params = {}) {
  const url = new URL(`${BASE}${path}`);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
  }
  url.searchParams.set('key', API_KEYS.WOLVAREX_API_KEY);
  return url.toString();
}

// For endpoints that return JSON metadata (e.g. { url: "..." } or
// { result: "..." }) rather than raw media bytes directly.
export async function wolvarexJson(path, params = {}) {
  if (!wolvarexConfigured()) throw new Error('WOLVAREX_API_KEY is not set — add it to .env');
  const res = await fetch(buildUrl(path, params));
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || data?.error || `Request failed (${res.status})`);
  return data;
}

// For endpoints that return raw media bytes (images/video/audio/stickers)
// directly in the response body.
export async function wolvarexBuffer(path, params = {}) {
  if (!wolvarexConfigured()) throw new Error('WOLVAREX_API_KEY is not set — add it to .env');
  const res = await fetch(buildUrl(path, params));
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try { const data = await res.json(); msg = data?.message || data?.error || msg; } catch {}
    throw new Error(msg);
  }
  const contentType = res.headers.get('content-type') || '';
  const arrayBuf = await res.arrayBuffer();
  return { buffer: Buffer.from(arrayBuf), contentType };
}
