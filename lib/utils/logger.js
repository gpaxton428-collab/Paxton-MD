// Developer-facing logger. Detailed technical errors go here (and only
// here) — user-facing messages come from lib/utils/errors.js.
import { redact } from './redact.js';

const stamp = () => new Date().toISOString().replace('T', ' ').slice(0, 19);

function fmt(level, scope, message, meta) {
  let line = `[${stamp()}] ${level.padEnd(5)} [${scope}] ${redact(message)}`;
  if (meta !== undefined) {
    try { line += ` ${redact(typeof meta === 'string' ? meta : JSON.stringify(meta))}`; } catch { /* ignore */ }
  }
  return line;
}

function recordLastError(scope, err) {
  const message = redact(err?.message || String(err));
  globalThis.__paxtonLastError = { time: new Date().toISOString(), scope, message };
  const list = (globalThis.__paxtonErrorLog ||= []);
  list.push(globalThis.__paxtonLastError);
  if (list.length > 50) list.shift();
}

export const logger = {
  info: (scope, message, meta) => console.log(fmt('INFO', scope, message, meta)),
  warn: (scope, message, meta) => console.warn(fmt('WARN', scope, message, meta)),
  debug: (scope, message, meta) => { if (process.env.LOG_LEVEL === 'debug') console.log(fmt('DEBUG', scope, message, meta)); },
  error: (scope, err, meta) => {
    recordLastError(scope, err);
    const msg = err instanceof Error ? `${err.message}${process.env.LOG_LEVEL === 'debug' && err.stack ? `\n${err.stack}` : ''}` : String(err);
    console.error(fmt('ERROR', scope, msg, meta));
  }
};
