// Hardened HTTP helpers: timeouts, size caps, redirect re-validation,
// content sniffing.
import { AppError } from './errors.js';
import { assertPublicHttpUrl } from './urlSafety.js';

export async function fetchWithTimeout(url, options = {}, timeoutMs = 25000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (err) {
    if (err?.name === 'AbortError') throw new AppError('Request timed out', { kind: 'timeout', cause: err });
    throw new AppError('Network error', { kind: 'network', technical: err?.cause?.code || err?.message, cause: err });
  } finally {
    clearTimeout(timer);
  }
}

const AUDIO_MAGIC = [
  (b) => b.slice(0, 3).toString() === 'ID3',
  (b) => b[0] === 0xff && (b[1] & 0xe0) === 0xe0,
  (b) => b.slice(4, 8).toString() === 'ftyp',
  (b) => b.slice(0, 4).toString() === 'OggS',
  (b) => b.slice(0, 4).toString() === 'RIFF',
  (b) => b.slice(0, 4).toString() === 'fLaC'
];
export function looksLikeAudio(buffer) {
  return buffer.length > 12 && AUDIO_MAGIC.some((f) => f(buffer));
}

// Downloads a public URL into a Buffer with a hard size cap. Every hop of a
// redirect chain is re-validated against the SSRF guard.
export async function downloadBuffer(url, { maxBytes = 50 * 1024 * 1024, timeoutMs = 90000, maxRedirects = 3, validate = true, rejectTypes = /^(text\/html|application\/json)/i } = {}) {
  let current = url;
  for (let hop = 0; hop <= maxRedirects; hop++) {
    if (validate) current = await assertPublicHttpUrl(current);
    const res = await fetchWithTimeout(current, { redirect: 'manual', headers: { 'User-Agent': 'Mozilla/5.0 PaxtonMD' } }, timeoutMs);
    if ([301, 302, 303, 307, 308].includes(res.status)) {
      const loc = res.headers.get('location');
      if (!loc) throw new AppError('Redirect without location', { kind: 'http' });
      current = new URL(loc, current).toString();
      continue;
    }
    if (!res.ok) throw new AppError(`Download failed (${res.status})`, { kind: 'http', status: res.status });
    const contentType = res.headers.get('content-type') || '';
    if (rejectTypes && rejectTypes.test(contentType)) throw new AppError(`Unexpected content type ${contentType}`, { kind: 'bad_response' });
    const declared = Number(res.headers.get('content-length'));
    if (Number.isFinite(declared) && declared > maxBytes) throw new AppError('File too large', { kind: 'too_large' });
    const chunks = []; let size = 0;
    const reader = res.body.getReader();
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > maxBytes) { try { await reader.cancel(); } catch { /* ignore */ } throw new AppError('File too large', { kind: 'too_large' }); }
      chunks.push(Buffer.from(value));
    }
    return { buffer: Buffer.concat(chunks), contentType, finalUrl: current };
  }
  throw new AppError('Too many redirects', { kind: 'http' });
}
