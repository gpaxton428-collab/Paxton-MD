// ============================================================
//  TEMPLATE ONLY — copy this to keys.js and fill in real values.
//  keys.js itself is gitignored, so your real keys never get
//  committed or pushed to GitHub.
//
//    cp api/keys.example.js api/keys.js
//
//  Both have genuinely free tiers (no credit card needed):
//  Gemini: https://aistudio.google.com/apikey
//  Groq:   https://console.groq.com/keys
// ============================================================
export const API_KEYS = {
  OPENAI_API_KEY: '',
  ANTHROPIC_API_KEY: '',
  REMOVEBG_API_KEY: '',
  OPENWEATHER_API_KEY: '',
  GEMINI_API_KEY: '',
  GEMINI_API_KEY_BACKUP: '',
  GROQ_API_KEY: ''
};

export function hasKey(name) {
  return Boolean(API_KEYS[name] && API_KEYS[name].trim().length > 0);
}
