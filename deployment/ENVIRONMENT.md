# Deployment environment

Required: Node.js 20+. Current package target: Baileys 7.0.0-rc14.

Recommended variables:
- `SESSION_ID` — private PAXTON-MD session string.
- `BOT_PREFIX` — default `.`.
- `BOT_NAME` — display name.
- `OWNER_NAME` — owner label.
- `PORT` — `3000` for web-enabled hosts.
- `WOLVAREX_API_KEY` — optional API provider key.

Persist these paths on hosts with ephemeral filesystems:
- `session/`
- `data/`
- `temp_sessions/`

Never commit `.env`, session credentials, or runtime database JSON files.

## Interactive buttons

Menu/category buttons are command-backed native-flow replies. They do not use an application-side expiry timer, so a button remains usable as long as WhatsApp still has the original message and the bot is online. A button tap is translated back into the same prefix-aware command path as typed text.
