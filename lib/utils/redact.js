// Strips secrets and filesystem details from any text before it is logged
// or sent to a chat. Applied globally to outgoing messages (see
// lib/helpers/safeSend.js) and to every log line (lib/utils/logger.js).
import os from 'os';
import { ROOT_DIR } from '../../config/index.js';

const SECRET_NAME = /(API_?KEY|TOKEN|SECRET|PASSWORD|PASSWD|SESSION_ID|PRIVATE)/i;

function secretValues() {
  const out = [];
  for (const [name, value] of Object.entries(process.env)) {
    if (SECRET_NAME.test(name) && typeof value === 'string' && value.trim().length >= 8) out.push(value.trim());
  }
  return out.sort((a, b) => b.length - a.length);
}

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function redact(input) {
  if (input === undefined || input === null) return input;
  let text = typeof input === 'string' ? input : String(input);
  for (const secret of secretValues()) text = text.split(secret).join('[REDACTED]');
  // key=..., apikey=..., token=... in URLs / query strings
  text = text.replace(/([?&;\s"'](?:api_?key|key|token|access_token|secret|apikey)=)[^&\s"')]+/gi, '$1[REDACTED]');
  text = text.replace(/(Bearer\s+)[A-Za-z0-9._~+/=-]{8,}/gi, '$1[REDACTED]');
  // Filesystem paths
  const roots = [ROOT_DIR, os.homedir()].filter((p) => p && p.length > 3);
  for (const r of roots) text = text.replace(new RegExp(escapeRe(r), 'g'), '.');
  return text;
}

export function redactError(err) {
  if (!err) return 'Unknown error';
  return redact(err.message || String(err));
}
