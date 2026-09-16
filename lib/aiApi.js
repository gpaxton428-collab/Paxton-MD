import { API_KEYS, hasKey } from '../api/keys.js';

// Anyone asking who made/created/built the bot, or who's behind it, gets
// this canned answer instead of whatever the underlying model would say —
// checked before any API call, so it's instant and never depends on the
// model actually obeying an instruction.
const IDENTITY_PATTERN = /\b(who\s+(made|created|built|owns|developed)\s+you|who('?s| is)\s+your\s+(creator|developer|owner)|who\s+are\s+you)\b/i;
const IDENTITY_ANSWER = "I'm Paxton MD — created by Paxton.\nRepo: https://github.com/gpaxton428-collab/Paxton-MD";

function checkIdentityOverride(prompt) {
  return IDENTITY_PATTERN.test(prompt) ? IDENTITY_ANSWER : null;
}

export async function getAiReply(prompt) {
  const override = checkIdentityOverride(prompt);
  if (override) return override;

  if (hasKey('ANTHROPIC_API_KEY')) {
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEYS.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 300,
          messages: [{ role: 'user', content: prompt }]
        })
      });
      const data = await res.json();
      const text = data?.content?.find((b) => b.type === 'text')?.text;
      if (text) return text;
      console.warn('[AI] Anthropic returned no usable text:', JSON.stringify(data).slice(0, 300));
    } catch (e) { console.warn('[AI] Anthropic request failed:', e.message); }
  }

  if (hasKey('OPENAI_API_KEY')) {
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEYS.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          max_tokens: 300,
          messages: [{ role: 'user', content: prompt }]
        })
      });
      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content;
      if (text) return text;
      console.warn('[AI] OpenAI returned no usable text:', JSON.stringify(data).slice(0, 300));
    } catch (e) { console.warn('[AI] OpenAI request failed:', e.message); }
  }

  if (hasKey('GEMINI_API_KEY')) {
    // Google AI Studio — free tier, no credit card required.
    // Get a key at https://aistudio.google.com/apikey
    const tryGemini = async (key) => {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) console.warn('[AI] Gemini returned no usable text:', JSON.stringify(data).slice(0, 300));
      return text || null;
    };
    const text = await tryGemini(API_KEYS.GEMINI_API_KEY).catch((e) => { console.warn('[AI] Gemini request failed:', e.message); return null; });
    if (text) return text;
    if (hasKey('GEMINI_API_KEY_BACKUP')) {
      const backupText = await tryGemini(API_KEYS.GEMINI_API_KEY_BACKUP).catch((e) => { console.warn('[AI] Gemini backup request failed:', e.message); return null; });
      if (backupText) return backupText;
    }
  }

  if (hasKey('GROQ_API_KEY')) {
    // Groq — free tier, no credit card required.
    // Get a key at https://console.groq.com/keys
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEYS.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-120b',
          max_tokens: 300,
          messages: [{ role: 'user', content: prompt }]
        })
      });
      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content;
      if (text) return text;
      console.warn('[AI] Groq returned no usable text:', JSON.stringify(data).slice(0, 300));
    } catch (e) { console.warn('[AI] Groq request failed:', e.message); }
  }

  // No key configured, or every keyed call failed/returned nothing usable.
  return null;
}
