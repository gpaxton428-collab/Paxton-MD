import { redact } from './redact.js';

// Centralised error strategy.
//  - Throw AppError/ApiError (with a `kind`) from library code.
//  - Call toUserMessage(err) to get a safe, friendly chat message.
//  - Technical detail stays on err.technical / err.cause and is logged only.
export class AppError extends Error {
  constructor(message, { kind = 'internal', userMessage, technical, status, cause } = {}) {
    super(message);
    this.name = 'AppError';
    this.kind = kind;
    this.userMessage = userMessage;
    this.technical = technical;
    this.status = status;
    if (cause) this.cause = cause;
  }
}
export class ApiError extends AppError {
  constructor(message, opts = {}) { super(message, opts); this.name = 'ApiError'; }
}

const UNAVAILABLE = '❌ *Request failed*\n\nThe service is temporarily unavailable.\nPlease try again later.';

export function toUserMessage(err) {
  if (err instanceof AppError && err.userMessage) return err.userMessage;
  const kind = err?.kind;
  switch (kind) {
    case 'config':
      return '❌ *Feature not configured*\n\nThe bot owner needs to set up the API key for this feature.';
    case 'timeout':
      return '❌ *Request timed out*\n\nThe service took too long to respond.\nPlease try again in a moment.';
    case 'rate_limit':
      return '⏳ *Too many requests*\n\nThe service is rate limiting the bot. Please wait a minute and try again.';
    case 'auth':
      return '❌ *Request failed*\n\nThe service refused the request.\nThe bot owner may need to check the API configuration.';
    case 'no_results':
      return '🔎 *No results found*\n\nTry a different search.';
    case 'invalid_input':
      return `❌ ${err.message}`;
    case 'too_large':
      return '❌ *File too large*\n\nThat file is bigger than the bot is allowed to handle.';
    case 'unsafe_url':
      return '❌ *Link not allowed*\n\nOnly public http(s) links are supported.';
    case 'bad_response':
    case 'network':
    case 'http':
    case 'api':
      return UNAVAILABLE;
    default:
      return '❌ *Something went wrong*\n\nThe command could not be completed. Please try again later.';
  }
}

// One-line, redacted, length-limited error text for the few commands that
// still show *why* a WhatsApp action failed (e.g. "not-authorized").
// Network/timeout noise is translated; paths and secrets are stripped.
export function safeErrorMessage(err) {
  const raw = String(err?.message || err || '');
  if (/fetch failed|ECONN|ENOTFOUND|EAI_AGAIN|ETIMEDOUT|socket hang up|network/i.test(raw)) return 'the service is temporarily unavailable, please try again later';
  if (/timed? ?out|aborted/i.test(raw)) return 'the request timed out, please try again';
  const line = redact(raw.split('\n')[0]).replace(/\s+at\s+.*$/, '').trim();
  return line.length > 120 ? `${line.slice(0, 117)}...` : line || 'unexpected error';
}
