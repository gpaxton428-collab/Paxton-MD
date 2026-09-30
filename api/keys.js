// ============================================================
//  Central place for third-party API keys used by commands.
//  Nothing here is required for the bot's core features — only
//  for the specific commands that call an external paid/keyed API.
//  Add real values to your .env file; this just reads them.
// ============================================================
import dotenv from 'dotenv';
dotenv.config();

export const API_KEYS = {
  // Used by commands/utility/ai.js (chatbot auto-reply) — set ONE of these.
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || '',

  // Optional — only needed if you wire up commands that use them.
  REMOVEBG_API_KEY: process.env.REMOVEBG_API_KEY || '',
  OPENWEATHER_API_KEY: process.env.OPENWEATHER_API_KEY || ''
};

export function hasKey(name) {
  return Boolean(API_KEYS[name] && API_KEYS[name].trim().length > 0);
}
