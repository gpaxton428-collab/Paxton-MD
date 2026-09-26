// /ai/<provider>  /ai/translate  /ai/tools/generate
import { getJson, getAuto } from './wolvarex.js';
import { extractText, findUrl, pickResult, summarizeShape } from './normalize.js';
import { AppError, ApiError } from '../utils/errors.js';
import { fetchWithTimeout } from '../utils/http.js';
import { logger } from '../utils/logger.js';

// NOTE: "wormgpt" is intentionally not wired up here — it's marketed as an
// uncensored model for writing malware/phishing content, not a general
// chat provider, so it's excluded regardless of what the upstream API offers.
const CHAT_PATHS = {
  gpt: '/ai/gpt', claude: '/ai/claude', mistral: '/ai/mistral', gemini: '/ai/gemini',
  deepseek: '/ai/deepseek', venice: '/ai/venice', groq: '/ai/groq', cohere: '/ai/cohere',
  llama: '/ai/llama', mixtral: '/ai/mixtral', phi: '/ai/phi', qwen: '/ai/qwen',
  falcon: '/ai/falcon', vicuna: '/ai/vicuna', openchat: '/ai/openchat', wizard: '/ai/wizard',
  zephyr: '/ai/zephyr', codellama: '/ai/codellama', starcoder: '/ai/starcoder',
  dolphin: '/ai/dolphin', nous: '/ai/nous', openhermes: '/ai/openhermes', neural: '/ai/neural',
  solar: '/ai/solar', yi: '/ai/yi', tinyllama: '/ai/tinyllama', orca: '/ai/orca',
  command: '/ai/command', nemotron: '/ai/nemotron', internlm: '/ai/internlm',
  chatglm: '/ai/chatglm', blackbox: '/ai/blackbox', replit: '/ai/replit',
  notegpt: '/ai/notegpt', 'notegpt-deepseek': '/ai/notegpt-deepseek', 'notegpt-pro': '/ai/notegpt-pro'
};
export const AI_PROVIDERS = Object.keys(CHAT_PATHS);
export const MAX_PROMPT_CHARS = 2000;

export function cleanPrompt(text) {
  const p = String(text || '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').trim();
  if (!p) throw new AppError('Please include a question or prompt.', { kind: 'invalid_input' });
  if (p.length > MAX_PROMPT_CHARS) throw new AppError(`That prompt is too long (max ${MAX_PROMPT_CHARS} characters).`, { kind: 'invalid_input' });
  return p;
}

export async function askAi(provider, prompt) {
  const path = CHAT_PATHS[provider];
  if (!path) throw new AppError(`Unknown AI provider ${provider}`, { kind: 'internal' });
  const q = cleanPrompt(prompt);
  const data = await getJson(path, { q }, { timeoutMs: 60000 });
  const text = extractText(data);
  if (!text) { logger.warn('ai', `${provider}: no text in response`, summarizeShape(data)); throw new ApiError('Empty AI response', { kind: 'bad_response' }); }
  return text;
}

// Wolvarex first (undocumented params, so the common aliases are sent
// together); the free MyMemory service is kept as a fallback so .translate
// keeps working exactly as it did before.
export async function translateText(text, target = 'en') {
  const t = cleanPrompt(text);
  const to = String(target || 'en').trim();
  if (!/^[a-zA-Z]{2,3}([-_][a-zA-Z]{2,4})?$/.test(to)) throw new AppError('Use a language code like en, es, fr, pt-BR. See .listlanguages', { kind: 'invalid_input' });
  try {
    const data = await getJson('/ai/translate', { text: t, q: t, to, lang: to, target: to });
    const out = extractText(data);
    if (out) return { text: out, provider: 'wolvarex' };
    logger.warn('translate', 'Wolvarex returned no text', summarizeShape(data));
  } catch (err) {
    if (err.kind === 'invalid_input') throw err;
    logger.warn('translate', `Wolvarex translate failed (${err.kind || 'error'}), using fallback`);
  }
  const res = await fetchWithTimeout(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(t.slice(0, 480))}&langpair=${encodeURIComponent(`autodetect|${to}`)}`, {}, 15000);
  const json = await res.json().catch(() => null);
  const out = json?.responseData?.translatedText;
  if (!out) throw new ApiError('Translation failed', { kind: 'bad_response' });
  return { text: out, provider: 'mymemory' };
}

// Returns { url } or { buffer }.
export async function generateImage({ prompt, ratio = '1:1', model = 'flux' }) {
  const p = cleanPrompt(prompt);
  const out = await getAuto('/ai/tools/generate', { prompt: p, ratio, model }, { timeoutMs: 120000, retries: 0 });
  if (out.type === 'buffer') return { buffer: out.buffer };
  const url = findUrl(pickResult(out.data), { prefer: ['url', 'image', 'images', 'output', 'result'], avoid: ['thumbnail', 'thumb'] });
  if (!url) { logger.warn('ai', 'Image generation returned no URL', summarizeShape(out.data)); throw new ApiError('No image in response', { kind: 'bad_response' }); }
  return { url };
}

// Legacy DALL-E route used by .imagine (falls back to generateImage).
export async function generateImageDalle(prompt) {
  const p = cleanPrompt(prompt);
  const out = await getAuto('/ai/image/dall-e', { q: p, prompt: p }, { timeoutMs: 120000, retries: 0 });
  if (out.type === 'buffer') return { buffer: out.buffer };
  const url = findUrl(pickResult(out.data), { prefer: ['url', 'image', 'images', 'result'], avoid: ['thumbnail', 'thumb'] });
  if (!url) throw new ApiError('No image in response', { kind: 'bad_response' });
  return { url };
}
