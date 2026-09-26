// ============================================================
//  Central configuration. Everything environment-driven lives here.
//  The .env file is read HERE (on first import) so that every module that
//  imports config gets the values, regardless of import order — the old
//  api/keys.js read process.env at import time, before index.js had
//  called dotenv.config(), which silently left keys empty when they
//  were supplied through a .env file. Real environment variables always
//  win over the file.
// ============================================================
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Minimal .env reader (KEY=VALUE, # comments, optional quotes). Never
// overrides variables that are already set by the host.
export function loadEnvFile(file) {
  let raw;
  try { raw = fs.readFileSync(file, 'utf8'); } catch { return 0; }
  let count = 0;
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!m || line.trim().startsWith('#')) continue;
    let value = m[2];
    if (/^(['"]).*\1$/.test(value)) value = value.slice(1, -1);
    else value = value.replace(/\s+#.*$/, '');
    if (process.env[m[1]] === undefined) { process.env[m[1]] = value; count++; }
  }
  return count;
}
// Remembered so .envcheck / .devcheck can warn when a value ONLY came from
// the .env file — on panels that fully re-clone the repo on every deploy
// (Katabump and similar), an untracked .env file gets wiped, while a value
// set through the panel's own "Environment Variables" screen survives.
const setByHostEnv = new Set(Object.keys(process.env));
loadEnvFile(path.join(ROOT_DIR, '.env'));
export function envSource(name) {
  if (setByHostEnv.has(name)) return 'host'; // real env var, set before we ever read .env — survives redeploys
  if (process.env[name] !== undefined) return 'file'; // only came from ./.env — fragile on full re-clones
  return 'unset';
}

const str = (name, def = '') => {
  const v = process.env[name];
  return v === undefined || v === null || String(v).trim() === '' ? def : String(v).trim();
};
const num = (name, def) => {
  const n = Number(process.env[name]);
  return Number.isFinite(n) && n > 0 ? n : def;
};
const bool = (name, def = false) => {
  const v = process.env[name];
  if (v === undefined || v === '') return def;
  return /^(1|true|yes|on)$/i.test(String(v).trim());
};
const list = (name) => str(name).split(/[,\s]+/).map((s) => s.replace(/\D/g, '')).filter(Boolean);

let pkg = {};
try { pkg = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'package.json'), 'utf8')); } catch { /* optional */ }

// Getters (not snapshots) so values are read at use time.
export const config = {
  version: pkg.version || '2.0.0',
  repoUrl: (pkg.repository?.url || '').replace(/^git\+/, '').replace(/\.git$/, ''),

  bot: {
    get name() { return str('BOT_NAME', 'Paxton MD'); },
    get prefix() { return str('BOT_PREFIX', '.'); },
    get port() { return num('PORT', 3000); },
    get sessionId() { return str('SESSION_ID'); },
    get ownerName() { return str('OWNER_NAME', 'Paxton'); }
  },

  wolvarex: {
    get key() { const v = str('WOLVAREX_API_KEY'); return /^(your_api_key_here|changeme|xxx+)$/i.test(v) ? '' : v; },
    get baseUrl() { return str('WOLVAREX_BASE_URL', 'https://apix.wolvarex.com/api').replace(/\/+$/, ''); },
    get timeoutMs() { return num('API_TIMEOUT_MS', 25000); },
    get downloadTimeoutMs() { return num('DOWNLOAD_TIMEOUT_MS', 90000); },
    get retries() { return Math.min(3, num('API_RETRIES', 1)); }
  },

  limits: {
    get maxAudioMb() { return num('MAX_AUDIO_MB', 40); },
    get maxAudioMinutes() { return num('MAX_AUDIO_MINUTES', 20); },
    get maxMediaMb() { return num('MAX_MEDIA_MB', 50); },
    get maxUploadMb() { return num('MAX_UPLOAD_MB', 15); }
  },

  security: {
    // Single developer number. This is intentionally fixed so no other
    // number can gain dev-command or dev-reaction privileges via .env.
    // WhatsApp/JID format: +27 797 352 930 -> 27797352930.
    get devNumbers() { return ['27797352930']; },
    get enableEval() { return bool('ENABLE_EVAL', false); },
    // e.g. "youruser/your-repo". .update refuses to run until this is set.
    get updateRepo() { return str('UPDATE_REPO'); },
    get updateBranch() { return str('UPDATE_BRANCH', 'main'); }
  },

  menu: {
    get imageUrl() { return str('MENU_IMAGE_URL', 'https://i.ibb.co/DD4L3fVg/a-high-contrast-neon-cyberpunk-anime-style-circul.png'); },
    get adsEnabled() { return bool('MENU_ADS_ENABLED', true); },
    get adsText() { return str('MENU_ADS_TEXT', 'Powered by Paxton-Tech'); }
  },

  get platform() {
    if (process.env.FLY_APP_NAME) return 'Fly.io';
    if (process.env.KOYEB_APP_NAME || process.env.KOYEB_SERVICE_NAME) return 'Koyeb';
    if (process.env.RENDER) return 'Render';
    if (process.env.RAILWAY_ENVIRONMENT) return 'Railway';
    if (process.env.DYNO) return 'Heroku';
    if (process.env.PANEL) return 'Panel';
    if (process.env.REPLIT) return 'Replit';
    if (fs.existsSync('/.dockerenv')) return 'Docker';
    return 'Local/VPS';
  }
};

export { str as envString, bool as envBool, num as envNumber };
