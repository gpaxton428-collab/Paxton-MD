# Paxton MD

A self-hosted WhatsApp bot built on [Baileys](https://github.com/WhiskeySockets/Baileys) — 290 commands across group moderation, owner administration, utilities, fun/games, media/stickers, and fully customizable menu styles.

## Features

- 290 commands across 9 categories (utility, fun, group, owner, settings, dev, media, menu styles, AI)
- Multi-prefix support — run several prefixes at once (`.setprefix`, `.addprefix`, `.removeprefix`)
- 8 menu styles, switchable live with `.menustyle`
- AI chatbot auto-reply with automatic fallback across Anthropic → OpenAI → Gemini → Groq
- Group moderation: antilink, antispam, antitag, antibadword, antidemote, antipromote, antifake, antidelete
- Welcome/goodbye messages with live group name + member count
- Group join-request management (`.pending`, `.acceptall`, `.rejectall`)
- Sticker tools with real EXIF pack/author branding
- Pairing website (in `session-generator/`) for QR or pairing-code login, no terminal needed

| Category | Count |
|---|---|
| 🧰 Utility | 68 |
| 🎲 Fun | 68 |
| 👥 Group | 61 |
| 👑 Owner | 38 |
| ⚙️ Settings | 25 |
| 🛠️ Dev | 12 |
| 🖼️ Media | 9 |
| 🎨 Menu Styles | 6 |
| 🤖 AI | 3 |

## Requirements

- Node.js 20 or newer
- A WhatsApp account to link as the bot

> **Note on `overrides` in package.json:** Baileys' own dependency tree
> points `libsignal` at a raw GitHub URL instead of the published npm
> package. Some hosts (bot-hosting.net included) disable git-based
> package fetches entirely and fail with `EALLOWGIT` during install.
> The `overrides` field forces `libsignal` to resolve from the real,
> published npm package (`WhiskeySockets/libsignal-node`, published as
> plain `libsignal`) instead. Don't remove it unless you've confirmed
> your host allows git fetches.

## Setup

```bash
git clone https://github.com/gpaxton428-collab/Paxton-MD.git
cd Paxton-MD
npm install
```

`.env` is already tracked in this repo with working defaults — edit the values directly to use your own keys/settings.

### First-time login

```bash
npm start
```

If `SESSION_ID` in `.env` is blank, the bot will ask for pairing-code login in the terminal (only works with an interactive console — not on Render or most panel hosts). To skip that:

- Use the pairing website (`session-generator/`) to generate a session string, then paste it into `SESSION_ID` in `.env`, **or**
- On panels with no interactive console and no custom env vars (Katabump, bot-hosting.net, most free Pterodactyl panels), paste the session string into `session_id.txt` in the project root instead.

### API keys

`api/keys.js` only reads from environment variables — the real values live in `.env`:

```
GEMINI_API_KEY=...
GEMINI_API_KEY_BACKUP=...
GROQ_API_KEY=...
WOLVAREX_API_KEY=...
```

Both Gemini ([aistudio.google.com/apikey](https://aistudio.google.com/apikey)) and Groq ([console.groq.com/keys](https://console.groq.com/keys)) have genuinely free tiers with no credit card required. `WOLVAREX_API_KEY` powers the media converter, downloader, and search commands (`.giftovideo`, `.tiktokdl`, `.videosearch`, `.imagine`, `.catbox`, etc.) — get one from wolvarex's own site.

## Prefix

Default prefix is `.`. Change it with `.setprefix <symbol>`, or run multiple at once with `.addprefix <symbol>` / `.removeprefix <symbol>`. Typing the bare word `prefix` or `ping` (no symbol at all) always works regardless of the configured prefix.

> **Note for Termux users:** the bot's prefix env var is named `BOT_PREFIX`, not `PREFIX` — Termux itself already uses `PREFIX` internally for its own install path, so naming it that would silently break things.

## Menu

`.menu` shows the current menu style. Switch styles with `.menustyle <1-8>`, preview all of them with `.menupreview`.

## License

MIT
