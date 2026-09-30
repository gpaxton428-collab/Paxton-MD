# /api

Central place for third-party API keys. Commands that need a paid/keyed
service (like the AI chatbot auto-reply) import from `api/keys.js`
instead of reading `process.env` directly, so all key management lives
in one file.

To add a key:
1. Add it to `.env` (e.g. `OPENAI_API_KEY=sk-...`)
2. Add it to the `API_KEYS` object in `keys.js` if it isn't there yet
3. Import `{ API_KEYS }` or `{ hasKey }` from `../api/keys.js` in your command
