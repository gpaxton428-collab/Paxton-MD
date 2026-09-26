// /url/imgbb  and  /url/catbox  (multipart file upload)
import { postForm } from './wolvarex.js';
import { findUrl, pickResult, summarizeShape } from './normalize.js';
import { ApiError, AppError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import { config } from '../../config/index.js';

const EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif', 'video/mp4': 'mp4', 'audio/mpeg': 'mp3', 'audio/ogg': 'ogg', 'audio/mp4': 'm4a' };

async function upload(path, buffer, mimetype, base) {
  const max = config.limits.maxUploadMb * 1024 * 1024;
  if (!buffer?.length) throw new AppError('Empty file', { kind: 'invalid_input' });
  if (buffer.length > max) throw new AppError('File too large', { kind: 'too_large' });
  const ext = EXT[(mimetype || '').split(';')[0]] || 'bin';
  const form = new FormData();
  form.append('file', new Blob([buffer], { type: mimetype || 'application/octet-stream' }), `${base}.${ext}`);
  const data = await postForm(path, form, { timeoutMs: 90000 });
  const link = findUrl(pickResult(data), { prefer: ['url', 'link', 'display_url', 'direct_url', 'result'] });
  if (!link) { logger.warn('upload', `${path}: no link in response`, summarizeShape(data)); throw new ApiError('No link returned', { kind: 'bad_response' }); }
  return link;
}

export const uploadToImgbb = (buffer, mimetype = 'image/jpeg') => upload('/url/imgbb', buffer, mimetype, 'upload');
export const uploadToCatbox = (buffer, mimetype) => upload('/url/catbox', buffer, mimetype, 'upload');
