// /converter/*  — URL in, converted media out. The source URL is validated
// (public http/https only) before it is handed to the remote service.
import { getAuto } from './wolvarex.js';
import { findUrl, pickResult, summarizeShape } from './normalize.js';
import { ApiError, AppError } from '../utils/errors.js';
import { assertPublicHttpUrl } from '../utils/urlSafety.js';
import { downloadBuffer } from '../utils/http.js';
import { logger } from '../utils/logger.js';
import { config } from '../../config/index.js';

export async function convertFromUrl(path, sourceUrl) {
  const safe = await assertPublicHttpUrl(sourceUrl);
  const out = await getAuto(path, { url: safe }, { timeoutMs: 90000, retries: 0 });
  if (out.type === 'buffer') return out.buffer;
  const link = findUrl(pickResult(out.data), { prefer: ['url', 'result', 'output', 'download'] });
  if (!link) {
    logger.warn('convert', `${path}: no output in response`, summarizeShape(out.data));
    throw new ApiError('No converted file in response', { kind: 'bad_response' });
  }
  const { buffer } = await downloadBuffer(link, { maxBytes: config.limits.maxMediaMb * 1024 * 1024 });
  if (!buffer.length) throw new AppError('Empty file', { kind: 'bad_response' });
  return buffer;
}
