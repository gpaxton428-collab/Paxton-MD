// ============================================================
//  Central place for third-party API keys used by commands.
//  This file is safe to commit/push — it only reads from
//  environment variables, it never contains real key values.
//  Put your actual keys in .env (which stays gitignored).
// ============================================================
export const API_KEYS = {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || '',
  REMOVEBG_API_KEY: process.env.REMOVEBG_API_KEY || '',
  OPENWEATHER_API_KEY: process.env.OPENWEATHER_API_KEY || '',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  GEMINI_API_KEY_BACKUP: process.env.GEMINI_API_KEY_BACKUP || '',
  GROQ_API_KEY: process.env.GROQ_API_KEY || '',
  WOLVAREX_API_KEY: process.env.WOLVAREX_API_KEY || ''
};

export function hasKey(name) {
  return Boolean(API_KEYS[name] && API_KEYS[name].trim().length > 0);
}
