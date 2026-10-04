// Third-party API keys. Values are read lazily from the environment
// (loaded by config/index.js) and are NEVER stored in source control.
import './index.js';

const NAMES = [
  'WOLVAREX_API_KEY', 'OPENAI_API_KEY', 'ANTHROPIC_API_KEY', 'REMOVEBG_API_KEY',
  'OPENWEATHER_API_KEY', 'GEMINI_API_KEY', 'GEMINI_API_KEY_BACKUP', 'GROQ_API_KEY'
];

export const API_KEYS = {};
for (const name of NAMES) {
  Object.defineProperty(API_KEYS, name, { enumerable: true, get: () => (process.env[name] || '').trim() });
}

export function hasKey(name) {
  return Boolean(API_KEYS[name] && API_KEYS[name].length > 0);
}
