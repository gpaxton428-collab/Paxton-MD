export function formatDuration(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  const parts = [];
  if (d) parts.push(`${d}d`);
  if (d || h) parts.push(`${h}h`);
  parts.push(`${m}m`, `${sec}s`);
  return parts.join(' ');
}
// "Xh Xm Xs" — always includes hours, as used by .ping / .runtime / menu.
export function formatRuntimeHMS(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds));
  return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m ${s % 60}s`;
}
export function formatClock(seconds) {
  const s = Math.max(0, Math.floor(seconds || 0));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  return h ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}` : `${m}:${String(sec).padStart(2, '0')}`;
}
// "3:45" / "1:02:03" / 225 / "225" -> seconds (or null)
export function parseDurationToSeconds(v) {
  if (v === undefined || v === null || v === '') return null;
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  const str = String(v).trim();
  if (/^\d+$/.test(str)) return Number(str);
  if (/^\d{1,2}(:\d{1,2}){1,2}$/.test(str)) return str.split(':').reduce((acc, p) => acc * 60 + Number(p), 0);
  return null;
}
export function formatBytes(n) {
  if (!Number.isFinite(n)) return '?';
  if (n < 1024) return `${n} B`;
  if (n < 1048576) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1048576).toFixed(1)} MB`;
}
export function truncate(text, max) {
  const s = String(text ?? '');
  return s.length > max ? `${s.slice(0, Math.max(0, max - 1))}…` : s;
}
export function cleanFileName(name, fallback = 'file') {
  const cleaned = String(name || '').replace(/[\\/:*?"<>|\u0000-\u001f]/g, '').replace(/\s+/g, ' ').trim().slice(0, 100);
  return cleaned || fallback;
}
