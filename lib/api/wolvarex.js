// The ONE place that talks to the Wolvarex API. All other modules
// (music, ai, fun, tools, upload, social) go through here, so the key,
// timeouts, retries, error mapping and redaction are handled once.
import { config } from '../../config/index.js';
import { ApiError, AppError } from '../utils/errors.js';
import { fetchWithTimeout } from '../utils/http.js';
import { logger } from '../utils/logger.js';
import { summarizeShape } from './normalize.js';

export function isConfigured() { return Boolean(config.wolvarex.key); }

function requireKey() {
  if (!isConfigured()) throw new AppError('WOLVAREX_API_KEY is not set', { kind: 'config' });
}

function buildUrl(path, params = {}) {
  const url = new URL(`${config.wolvarex.baseUrl}${path.startsWith('/') ? path : `/${path}`}`);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
  }
  url.searchParams.set('key', config.wolvarex.key);
  return url.toString();
}

const RETRYABLE = new Set([502, 503, 504]);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function mapHttpError(status, path) {
  const opts = { status, technical: `HTTP ${status} from ${path}` };
  if (status === 401 || status === 403) return new ApiError(`Auth rejected (${status})`, { ...opts, kind: 'auth' });
  if (status === 429) return new ApiError('Rate limited', { ...opts, kind: 'rate_limit' });
  if (status === 404) return new ApiError('Endpoint not found', { ...opts, kind: 'http' });
  return new ApiError(`HTTP ${status}`, { ...opts, kind: 'http' });
}

// A 200 response can still carry an application-level failure flag.
function assertApiOk(data, path) {
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const failed = data.status === false || data.success === false || data.ok === false ||
      (typeof data.status === 'string' && /^(error|fail|failed)$/i.test(data.status)) ||
      (data.error && !data.result && !data.data);
    if (failed) {
      const detail = typeof data.message === 'string' ? data.message : typeof data.error === 'string' ? data.error : 'unspecified';
      throw new ApiError('API reported failure', { kind: 'api', technical: `${path}: ${detail}` });
    }
  }
}

// mode: 'json' (default) | 'auto' (json or binary) | 'buffer'
export async function call(path, { params = {}, method = 'GET', form, timeoutMs, retries, mode = 'json' } = {}) {
  requireKey();
  const attempts = 1 + (method === 'GET' ? (retries ?? config.wolvarex.retries) : 0);
  const timeout = timeoutMs || config.wolvarex.timeoutMs;
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetchWithTimeout(buildUrl(path, params), { method, body: form }, timeout);
      if (!res.ok) {
        if (RETRYABLE.has(res.status) && i < attempts - 1) { await sleep(800 * (i + 1)); continue; }
        throw mapHttpError(res.status, path);
      }
      const contentType = res.headers.get('content-type') || '';
      if (mode === 'buffer' || (mode === 'auto' && /^(image|video|audio)\//i.test(contentType))) {
        return { type: 'buffer', buffer: Buffer.from(await res.arrayBuffer()), contentType };
      }
      const raw = await res.text();
      let data;
      try { data = JSON.parse(raw); } catch {
        throw new ApiError('Response was not JSON', { kind: 'bad_response', technical: `${path}: non-JSON body (${contentType || 'no content-type'})` });
      }
      assertApiOk(data, path);
      logger.debug('wolvarex', `${path} ok`, summarizeShape(data));
      return mode === 'auto' ? { type: 'json', data } : data;
    } catch (err) {
      lastErr = err;
      const transient = err instanceof AppError && ['network', 'timeout'].includes(err.kind);
      if (transient && i < attempts - 1) { await sleep(800 * (i + 1)); continue; }
      break;
    }
  }
  logger.error('wolvarex', lastErr, { path });
  throw lastErr;
}

export const getJson = (path, params, opts = {}) => call(path, { params, ...opts });
export const getAuto = (path, params, opts = {}) => call(path, { params, mode: 'auto', ...opts });
export const postForm = (path, form, opts = {}) => call(path, { method: 'POST', form, ...opts });
