import fs from 'fs';
import path from 'path';

const ROOT = path.join(process.cwd(), 'data', 'database');
const BACKUP = path.join(ROOT, 'backups');
const fileFor = (name) => path.join(ROOT, `${String(name).replace(/[^a-zA-Z0-9._-]/g, '_')}.json`);

function ensure() { fs.mkdirSync(BACKUP, { recursive: true }); }
function clone(value) { return value === undefined ? undefined : JSON.parse(JSON.stringify(value)); }
function read(name, fallback = {}) {
  ensure();
  try { const raw = fs.readFileSync(fileFor(name), 'utf8'); return raw.trim() ? JSON.parse(raw) : clone(fallback); }
  catch { return clone(fallback); }
}
function atomicWrite(file, value) {
  const tmp = `${file}.tmp-${process.pid}-${Date.now()}`;
  fs.writeFileSync(tmp, JSON.stringify(value, null, 2));
  fs.renameSync(tmp, file);
}
export function dbGet(name, fallback = {}) { return read(name, fallback); }
export function dbSet(name, value) { ensure(); atomicWrite(fileFor(name), value); return value; }
export function dbUpdate(name, updater, fallback = {}) {
  const current = read(name, fallback);
  const next = updater(clone(current));
  dbSet(name, next);
  return next;
}
export function dbDelete(name) { try { fs.rmSync(fileFor(name), { force: true }); return true; } catch { return false; } }
export function dbBackup(name = 'all') {
  ensure();
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  if (name !== 'all') {
    const source = fileFor(name);
    if (!fs.existsSync(source)) return null;
    const target = path.join(BACKUP, `${path.basename(source, '.json')}-${stamp}.json`);
    fs.copyFileSync(source, target); return target;
  }
  const target = path.join(BACKUP, `database-${stamp}`);
  fs.mkdirSync(target, { recursive: true });
  for (const f of fs.readdirSync(ROOT)) if (f.endsWith('.json')) fs.copyFileSync(path.join(ROOT, f), path.join(target, f));
  return target;
}
export function dbStats() {
  ensure();
  const files = fs.readdirSync(ROOT).filter(f => f.endsWith('.json'));
  const bytes = files.reduce((n, f) => n + fs.statSync(path.join(ROOT, f)).size, 0);
  return { directory: ROOT, files: files.length, bytes, backups: fs.readdirSync(BACKUP).length };
}
export function dbPath() { ensure(); return ROOT; }
