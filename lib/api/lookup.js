// Generic /search/<kind> endpoints: wiki, news, github, npm, pypi,
// stackoverflow, reddit, urbandictionary, emoji, country, images.
// (/search/videos lives in tools.js since it already had its own shape.)
import { getJson } from './wolvarex.js';
import { pickResult, extractText, firstString, firstValue, summarizeShape } from './normalize.js';
import { AppError, ApiError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export async function lookup(kind, query) {
  const q = String(query || '').replace(/[\u0000-\u001f]/g, ' ').trim();
  if (!q) throw new AppError('Please include a search term.', { kind: 'invalid_input' });
  if (q.length > 200) throw new AppError('That search term is too long.', { kind: 'invalid_input' });
  const data = await getJson(`/search/${kind}`, { q, query: q, name: q });
  const raw = pickResult(data);
  if (raw == null || (Array.isArray(raw) && !raw.length)) throw new ApiError(`No ${kind} results for "${q}".`, { kind: 'no_results' });
  return raw;
}

// Turns whatever shape came back into a short list of "• Title — detail" lines.
export function summarizeList(raw, { titleKeys = ['title', 'name'], detailKeys = [], limit = 5 } = {}) {
  const items = Array.isArray(raw) ? raw : Array.isArray(raw?.items) ? raw.items : Array.isArray(raw?.results) ? raw.results : [raw];
  const lines = [];
  for (const item of items.slice(0, limit)) {
    if (typeof item === 'string') { lines.push(`• ${item}`); continue; }
    const title = firstString(item, titleKeys);
    if (!title) continue;
    const detail = detailKeys.length ? firstString(item, detailKeys) : undefined;
    lines.push(detail ? `• *${title}* — ${detail}` : `• ${title}`);
  }
  return lines;
}

export async function wikiSummary(query) {
  const raw = await lookup('wiki', query);
  const text = extractText(raw) || firstString(raw, ['summary', 'extract', 'description']);
  if (!text) { logger.warn('lookup', 'wiki: no summary text', summarizeShape(raw)); throw new ApiError('No summary available.', { kind: 'bad_response' }); }
  return { title: firstString(raw, ['title', 'name']) || String(query), text: text.slice(0, 1200), url: firstString(raw, ['url', 'link']) };
}

export async function countryInfo(name) {
  const raw = await lookup('country', name);
  const item = Array.isArray(raw) ? raw[0] : raw;
  const title = firstString(item, ['name', 'country']);
  if (!title) throw new ApiError('Country not found.', { kind: 'no_results' });
  return {
    name: title,
    capital: firstString(item, ['capital']),
    region: firstString(item, ['region', 'continent']),
    population: firstValue(item, ['population']),
    currency: firstString(item, ['currency', 'currencies']),
    flag: firstString(item, ['flag', 'flagUrl', 'flag_url'])
  };
}
