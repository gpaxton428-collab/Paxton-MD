// Finds and downloads media attached to (or quoted by) a message.
import { AppError } from '../utils/errors.js';
import { config } from '../../config/index.js';

const TYPES = ['imageMessage', 'videoMessage', 'audioMessage', 'stickerMessage', 'documentMessage'];

function unwrap(m) {
  if (!m) return m;
  return m.ephemeralMessage?.message || m.viewOnceMessage?.message || m.viewOnceMessageV2?.message || m.documentWithCaptionMessage?.message || m;
}

export function findMedia(msg, allowed = TYPES) {
  const own = unwrap(msg.message);
  const quoted = unwrap(own?.extendedTextMessage?.contextInfo?.quotedMessage
    || own?.imageMessage?.contextInfo?.quotedMessage || own?.videoMessage?.contextInfo?.quotedMessage);
  for (const container of [own, quoted]) {
    if (!container) continue;
    for (const t of allowed) if (container[t]) return { node: container[t], type: t.replace('Message', ''), mimetype: container[t].mimetype || '', quoted: container === quoted };
  }
  return null;
}

export async function downloadMedia(found, { maxBytes = config.limits.maxMediaMb * 1024 * 1024 } = {}) {
  const declared = Number(found.node.fileLength?.low ?? found.node.fileLength);
  if (Number.isFinite(declared) && declared > maxBytes) throw new AppError('File too large', { kind: 'too_large' });
  const { downloadContentFromMessage } = await import('@whiskeysockets/baileys');
  const stream = await downloadContentFromMessage(found.node, found.type === 'document' ? 'document' : found.type);
  const chunks = []; let size = 0;
  for await (const chunk of stream) {
    size += chunk.length;
    if (size > maxBytes) throw new AppError('File too large', { kind: 'too_large' });
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}
