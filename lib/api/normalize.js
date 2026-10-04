// Tolerant response helpers. The Wolvarex API is not publicly documented,
// so instead of assuming one shape these helpers look through the small set
// of field names that aggregator APIs commonly use. When a response can't be
// understood, summarizeShape() records ONLY its key structure (never values)
// in the developer log so the mapping can be adjusted.

export function pickResult(data) {
  if (data === null || data === undefined) return data;
  if (typeof data !== 'object' || Array.isArray(data)) return data;
  return data.result ?? data.results ?? data.data ?? data;
}

export function firstString(obj, keys) {
  if (!obj || typeof obj !== 'object') return undefined;
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === 'string' && v.trim()) return v.trim();
    if (typeof v === 'number' && Number.isFinite(v)) return String(v);
  }
  return undefined;
}

export function firstValue(obj, keys) {
  if (!obj || typeof obj !== 'object') return undefined;
  for (const k of keys) if (obj[k] !== undefined && obj[k] !== null && obj[k] !== '') return obj[k];
  return undefined;
}

const isHttp = (s) => typeof s === 'string' && /^https?:\/\//i.test(s.trim());

// Finds the first http(s) URL, preferring certain keys and skipping others.
export function findUrl(node, { prefer = ['download', 'downloadUrl', 'download_url', 'url', 'link', 'src', 'file'], avoid = ['thumbnail', 'thumb', 'cover', 'poster', 'avatar', 'icon'] } = {}, depth = 0) {
  if (node === null || node === undefined || depth > 4) return undefined;
  if (typeof node === 'string') return isHttp(node) ? node.trim() : undefined;
  if (Array.isArray(node)) {
    for (const item of node) { const r = findUrl(item, { prefer, avoid }, depth + 1); if (r) return r; }
    return undefined;
  }
  if (typeof node === 'object') {
    for (const k of prefer) if (k in node) { const r = findUrl(node[k], { prefer, avoid }, depth + 1); if (r) return r; }
    for (const [k, v] of Object.entries(node)) {
      if (prefer.includes(k) || avoid.includes(k.toLowerCase())) continue;
      const r = findUrl(v, { prefer, avoid }, depth + 1); if (r) return r;
    }
  }
  return undefined;
}

const TEXT_KEYS = ['text', 'message', 'answer', 'response', 'reply', 'content', 'output', 'translation', 'translated', 'translatedText', 'result'];
export function extractText(data, depth = 0) {
  if (data === null || data === undefined || depth > 3) return null;
  if (typeof data === 'string') return data.trim() || null;
  if (Array.isArray(data)) return data.length ? extractText(data[0], depth + 1) : null;
  if (typeof data === 'object') {
    for (const k of ['result', 'data', ...TEXT_KEYS]) {
      if (k in data) { const r = extractText(data[k], depth + 1); if (r) return r; }
    }
  }
  return null;
}

export function extractList(data) {
  const node = pickResult(data);
  if (Array.isArray(node)) return node;
  if (node && typeof node === 'object') {
    for (const k of ['results', 'items', 'videos', 'tracks', 'songs', 'list', 'entries', 'data', 'result', 'search']) {
      if (Array.isArray(node[k])) return node[k];
    }
  }
  return [];
}

export function summarizeShape(data, depth = 0) {
  if (data === null) return 'null';
  if (Array.isArray(data)) return `array(${data.length})${data.length && depth < 2 ? `<${summarizeShape(data[0], depth + 1)}>` : ''}`;
  if (typeof data === 'object') {
    if (depth >= 2) return 'object';
    return `{${Object.keys(data).slice(0, 12).map((k) => `${k}:${summarizeShape(data[k], depth + 1)}`).join(',')}}`;
  }
  return typeof data;
}
