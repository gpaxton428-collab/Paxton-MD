// Sandboxed path resolution for .ls/.cat/.download. Blocks traversal,
// symlink escapes and files that hold credentials.
import fs from 'fs';
import path from 'path';
import { ROOT_DIR } from '../../config/index.js';

const DENY_SEGMENTS = new Set(['.git', 'node_modules', 'session', 'temp_sessions', 'session_id.txt', 'owner.json', 'whitelist.json', 'creds.json']);
const DENY_PATTERNS = [/^\.env(\..*)?$/i, /^.*\.pem$/i, /^.*\.key$/i, /^id_(rsa|ed25519)/i];

export function resolveInProject(rel, { allowRoot = true } = {}) {
  const cleaned = String(rel || '.').replace(/\0/g, '');
  const target = path.resolve(ROOT_DIR, cleaned);
  const inside = (p) => p === ROOT_DIR || p.startsWith(ROOT_DIR + path.sep);
  if (!inside(target)) return { ok: false, reason: 'That path is outside the project folder.' };
  if (!allowRoot && target === ROOT_DIR) return { ok: false, reason: 'Specify a file.' };
  let real = target;
  try { real = fs.realpathSync(target); } catch { /* may not exist yet */ }
  let realRoot = ROOT_DIR;
  try { realRoot = fs.realpathSync(ROOT_DIR); } catch { /* ignore */ }
  if (!(real === realRoot || real.startsWith(realRoot + path.sep))) return { ok: false, reason: 'That path resolves outside the project folder.' };
  for (const seg of path.relative(ROOT_DIR, target).split(path.sep).filter(Boolean)) {
    if (DENY_SEGMENTS.has(seg) || DENY_PATTERNS.some((re) => re.test(seg))) {
      return { ok: false, reason: 'That file is protected (it may contain credentials).' };
    }
  }
  return { ok: true, path: target, relative: path.relative(ROOT_DIR, target) || '.' };
}
