import { API_KEYS, hasKey } from '../api/keys.js';

// Anyone asking who made/created/built the bot, or who's behind it, gets
// this canned answer instead of whatever the underlying model would say —
// checked before any API call, so it's instant and never depends on the
// model actually obeying an instruction.
const IDENTITY_PATTERN = /\b(who\s+(made|created|built|owns|developed)\s+you|who('?s| is)\s+your\s+(creator|developer|owner)|who\s+are\s+you)\b/i;
const IDENTITY_ANSWER = "I'm Paxton Tech — created by Paxton.";

function checkIdentityOverride(prompt) {
  return IDENTITY_PATTERN.test(prompt) ? IDENTITY_ANSWER : null;
}

// NOTE: the free public GiftedTech demo endpoint (shared "apikey=gifted"
// key) was removed as an automatic fallback — it's a shared rate limit
// across every bot using it, so it was constantly returning its own
// "API key limit exceeded" / "system busy" error text, which then got
// forwarded to users as if it were a real AI reply. That's worse than
// just not replying. If you want the chatbot / .gpt4 working, set
// ANTHROPIC_API_KEY or OPENAI_API_KEY in your .env — both are real,
// reliable, pay-as-you-go APIs with their own free trial credit.
export async function getAiReply(prompt) {
  const override = checkIdentityOverride(prompt);
  if (override) return override;

  if (hasKey('ANTHROPIC_API_KEY')) {
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
    return null;
  }

  if (hasKey('OPENAI_API_KEY')) {
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
    return data?.choices?.[0]?.message?.content || null;
  }

  // No key configured — return null rather than calling an unreliable
  // shared-key public endpoint. Callers treat null as "stay silent".
  return null;
}
