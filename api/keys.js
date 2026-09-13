import dotenv from 'dotenv';
dotenv.config();

export const API_KEYS = {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || '',
  REMOVEBG_API_KEY: process.env.REMOVEBG_API_KEY || '',
  OPENWEATHER_API_KEY: process.env.OPENWEATHER_API_KEY || '',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  GEMINI_API_KEY_BACKUP: process.env.GEMINI_API_KEY_BACKUP || '',
  GROQ_API_KEY: process.env.GROQ_API_KEY || ''
};

export function hasKey(name) {
  return Boolean(API_KEYS[name] && API_KEYS[name].trim().length > 0);
}
