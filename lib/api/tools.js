// /tools/weather  /tools/screenshot  /search/videos
import { getJson, getAuto } from './wolvarex.js';
import { extractList, findUrl, firstString, firstValue, pickResult, summarizeShape } from './normalize.js';
import { AppError, ApiError } from '../utils/errors.js';
import { assertPublicHttpUrl } from '../utils/urlSafety.js';
import { fetchWithTimeout } from '../utils/http.js';
import { logger } from '../utils/logger.js';

const fmtVal = (v, unit = '') => (v === undefined || v === null || v === '' ? null : `${v}${unit}`);

export function formatWeatherObject(node, fallbackName) {
  if (!node || typeof node !== 'object' || Array.isArray(node)) return null;
  const loc = firstString(node, ['location', 'city', 'name', 'place']) || (typeof node.location === 'object' ? firstString(node.location, ['name', 'city']) : undefined) || fallbackName;
  const cur = typeof node.current === 'object' ? node.current : node;
  const temp = firstValue(cur, ['temp_c', 'temperature', 'temp', 'temp_C']);
  const feels = firstValue(cur, ['feelslike_c', 'feels_like', 'feelsLike', 'apparent']);
  const cond = firstString(cur, ['condition', 'description', 'weather', 'summary', 'text']) || (typeof cur.condition === 'object' ? firstString(cur.condition, ['text']) : undefined);
  const hum = firstValue(cur, ['humidity']);
  const wind = firstValue(cur, ['wind_kph', 'wind_speed', 'windSpeed', 'wind']);
  if (temp === undefined && !cond) return null;
  const lines = [`⛅ *Weather — ${loc}*`, ''];
  if (cond) lines.push(`🌤️ ${cond}`);
  if (temp !== undefined) lines.push(`🌡️ ${fmtVal(temp, /[a-z°]/i.test(String(temp)) ? '' : '°C')}${feels !== undefined ? ` (feels ${fmtVal(feels, /[a-z°]/i.test(String(feels)) ? '' : '°C')})` : ''}`);
  if (hum !== undefined) lines.push(`💧 Humidity: ${fmtVal(hum, /%/.test(String(hum)) ? '' : '%')}`);
  if (wind !== undefined) lines.push(`🌬️ Wind: ${fmtVal(wind, /[a-z]/i.test(String(wind)) ? '' : ' km/h')}`);
  return lines.join('\n');
}

export async function getWeather(city) {
  const c = String(city || '').replace(/[\u0000-\u001f]/g, ' ').trim();
  if (!c) throw new AppError('Please give a city name. Example: .weather Cape Town', { kind: 'invalid_input' });
  if (c.length > 80) throw new AppError('That city name is too long.', { kind: 'invalid_input' });
  try {
    const data = await getJson('/tools/weather', { city: c, q: c, location: c });
    const text = formatWeatherObject(pickResult(data), c);
    if (text) return text;
    logger.warn('weather', 'Unrecognised Wolvarex weather shape', summarizeShape(data));
  } catch (err) {
    if (err.kind === 'invalid_input') throw err;
    logger.warn('weather', `Wolvarex weather failed (${err.kind || 'error'}), using wttr.in`);
  }
  const res = await fetchWithTimeout(`https://wttr.in/${encodeURIComponent(c)}?format=%l:+%C+%t+(feels+%f)+💧%h+🌬️%w`, {}, 12000);
  if (!res.ok) throw new ApiError('Weather unavailable', { kind: 'http', status: res.status });
  const body = (await res.text()).trim();
  if (!body || /unknown location/i.test(body)) throw new AppError('Location not found', { kind: 'no_results' });
  return `⛅ ${body}`;
}

export async function takeScreenshot(url, { viewport = 'desktop', fullPage = false } = {}) {
  const safe = await assertPublicHttpUrl(url);
  const out = await getAuto('/tools/screenshot', { url: safe, viewport, full_page: fullPage ? 'true' : 'false' }, { timeoutMs: 60000, retries: 0 });
  if (out.type === 'buffer') return { buffer: out.buffer };
  const link = findUrl(pickResult(out.data), { prefer: ['url', 'image', 'screenshot', 'result'] });
  if (!link) { logger.warn('screenshot', 'No image in response', summarizeShape(out.data)); throw new ApiError('No screenshot in response', { kind: 'bad_response' }); }
  return { url: link };
}

export async function searchVideos(query, { page = 0, limit = 8 } = {}) {
  const q = String(query || '').replace(/[\u0000-\u001f]/g, ' ').trim();
  if (!q) throw new AppError('Please type what to search for.', { kind: 'invalid_input' });
  if (q.length > 120) throw new AppError('That search is too long (max 120 characters).', { kind: 'invalid_input' });
  const data = await getJson('/search/videos', { q, page: String(page) });
  const items = extractList(data).map((r) => (typeof r === 'object' && r ? {
    title: firstString(r, ['title', 'name']) || 'Untitled',
    url: firstString(r, ['url', 'link', 'videoUrl']),
    channel: (typeof r.author === 'string' ? r.author : r.author?.name) || firstString(r, ['channel', 'uploader']),
    duration: firstString(r, ['duration', 'timestamp', 'length'])
  } : null)).filter(Boolean).slice(0, limit);
  if (!items.length) throw new AppError('No results', { kind: 'no_results' });
  return items;
}
