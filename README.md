<div align="center">

# 🌑 PAXTON MD V2

**A self-hosted WhatsApp multi-device bot built on [Baileys](https://github.com/WhiskeySockets/Baileys) — 370 commands, text-only menus, Docker-ready.**

</div>

---

## Features

- **370 commands / 148 aliases** in 17 categories, loaded by a fault-tolerant plugin loader (one broken file never stops the bot; duplicates and alias clashes are skipped and reported).
- **Music** — `.play <song>` searches with the Wolvarex music API, downloads the audio and sends it with title, artist, duration and thumbnail.
- **AI** — `.flux`, `.imagine`, `.groqai`, `.gpt4`, `.gptdirect`, `.llamachat`, `.translate`.
- **Fun** — jokes, riddles, trivia, truth/dare, roasts, pickup/flirt lines, quotes, would-you-rather, fun facts (API first, built-in offline lists as fallback).
- **Downloads / search / tools** — Instagram, TikTok, YouTube audio, video search, website screenshots, weather, image hosting (imgbb / catbox).
- **Group & admin tooling**, welcome/goodbye, anti-spam/link/delete/view-once, automation, sudo list.
- **Text-only redesigned menus** — 6 views (public, private, group, owner, admin, user) × 8 layouts, permission-aware and compact, with the same "View Channel" chip as `.alive`.
- **Chatbot with memory** — replies to DMs and to mentions/replies in groups (never to its own outgoing messages), remembers the last few turns per chat (`.clearmemory` to reset).
- **Status automation** — `.autoviewstatus`, `.autostatusreact` + `.setstatusreactemoji`, `.ghostarchive`.
- **View-once capture** — automatic (owner DM) or react-to-capture with any emoji for anyone (`.setvvreact`).
- **Security-minded defaults** — API key only from the environment, SSRF guard on every URL, credential files unreadable by `.cat/.ls/.download`, `.eval` and `.update` disabled until you enable them, global output redaction.
- **Deploy anywhere** — Docker, Docker Compose, Fly.io, Koyeb, Render, Pterodactyl panels, plain Node.

## Command categories

| Category | Cmds | Category | Cmds |
|---|---|---|---|
| ADMIN | 40 | MEDIA | 7 |
| AI | 9 | OWNER | 39 |
| AUTOMATION | 8 | SUDO | 4 |
| BOT SETTINGS | 24 | TOOLS | 23 |
| CONVERTER | 7 | USER | 11 |
| DEV | 21 | DOWNLOAD | 5 |
| FUN | 77 | SEARCH | 3 |
| GROUP | 32 | UTILITY | 50 |
| | | MENU STYLE | 10 |

Send `.menu` in WhatsApp. `.menu list` = category index · `.menu ai` = one category · `.menu owner|admin|group|user|public|private` = a specific view (you can only open views you're entitled to).

## Requirements

- Node.js **20+** (22 works)
- `ffmpeg` on the host (stickers, video conversion, and the image-processing fallback used by `.setbotpp`)
- A WhatsApp account for the bot and a **Wolvarex API key** for the API-backed commands

## Installation

```bash
git clone <your-repo-url> Paxton-MD && cd Paxton-MD
npm install
cp .env.example .env      # then edit .env
npm start
```

First start: pick pairing-code login, or put a `PAXTON-MD:...` string in `SESSION_ID` (see `session-generator/`) to log in automatically.

## Configuration

Everything is configured through environment variables (a local `.env` file is read automatically; real environment variables always win). **`.env` is git-ignored — never commit it.**

| Variable | Purpose | Default |
|---|---|---|
| `WOLVAREX_API_KEY` | Key for every Wolvarex-backed command | *(unset → those commands are hidden from menus)* |
| `WOLVAREX_BASE_URL` | API base URL | `https://apix.wolvarex.com/api` |
| `API_TIMEOUT_MS` / `DOWNLOAD_TIMEOUT_MS` / `API_RETRIES` | Request tuning | `25000` / `90000` / `1` |
| `SESSION_ID` | Session string for automatic login | – |
| `BOT_NAME`, `BOT_PREFIX`, `OWNER_NAME` | Identity | `Paxton MD`, `.`, `Paxton` |
| `PORT` | Health/status web server | `3000` |
| `MENU_ADS_ENABLED`, `MENU_ADS_TEXT` | Default for the menu ad block | `true`, `Powered by Paxton-Tech` |
| `MENU_IMAGE_URL` | Header image when `.setmenuimage on` | built-in |
| `BOT_NOTICE_LINE` | Line above `.ping`/`.runtime` (`off` hides it) | `↪️ Forwarded many times` |
| `MAX_AUDIO_MB`, `MAX_AUDIO_MINUTES`, `MAX_MEDIA_MB`, `MAX_UPLOAD_MB` | Size limits | `40`, `20`, `50`, `15` |
| `DEV_NUMBERS` | Legacy setting; developer access is fixed to `27797352930` | *(ignored)* |
| `ENABLE_EVAL` | Enables `.eval` (arbitrary code — owner only) | `false` |
| `UPDATE_REPO` / `UPDATE_BRANCH` | `owner/repo` that `.update` pulls from | *(unset → `.update` disabled)* |
| `AUTO_JOIN_GROUP` | Auto-join the project support group on first connect | `false` |
| `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`, `GROQ_API_KEY`, `REMOVEBG_API_KEY`, `OPENWEATHER_API_KEY` | Optional extra providers | – |

### API configuration

All Wolvarex calls go through one client (`lib/api/wolvarex.js`); it reads `WOLVAREX_API_KEY` from the environment, applies timeouts and one retry for transient failures, and strips the key from any log line or chat message.

| Command(s) | Endpoint(s) |
|---|---|
| `.play`, `.songs`, `.ytmp3dl` | `/music/ytmp3-search`, `/music/ytmp3-download` |
| `.flux`, `.imagine` | `/ai/tools/generate` (`.imagine` tries `/ai/image/dall-e` first) |
| `.translate` | `/ai/translate` (MyMemory fallback) |
| `.groqai`, `.gpt4`/`.gptdirect`, `.llamachat` | `/ai/groq`, `/ai/gpt`, `/ai/llama` |
| `.riddle .pickupline .quote .flirtline .joke .wouldrather .roast .fact .dare .truth .trivia` | `/fun/riddles`, `/fun/pickuplines`, `/fun/quotes`, `/fun/flirt`, `/fun/jokes`, `/fun/wouldyourather`, `/fun/roasts`, `/fun/funfacts`, `/fun/dares`, `/fun/truth`, `/fun/trivia` |
| `.imgbb`, `.catbox` | `/url/imgbb`, `/url/catbox` |
| `.videosearch` (`.search`) | `/search/videos` |
| `.ssweb` | `/tools/screenshot` |
| `.weather` | `/tools/weather` (wttr.in fallback) |
| `.instadl` | `/download/instagram/igram` |
| `.giftovideo .stickertoimg .stickertovideo .videotogif .videotosticker .urltosticker` | `/converter/*` |
| `.claude .mistral .gemini .deepseek .venice .cohere .mixtral .phi .qwen .falcon .vicuna .openchat .wizard .zephyr .codellama .starcoder .dolphin .nous .openhermes .neural .solar .yi .tinyllama .orca .command .nemotron .internlm .chatglm .blackbox .replit .notegpt .notegptdeepseek .notegptpro` | `/ai/<provider>` (33 more chat models; `wormgpt` deliberately excluded — see Security notes) |
| `.shazam .shazamsearch .shazamtrack` | `/shazam/recognize`, `/shazam/search`, `/shazam/track/:id` |
| `.spotifytrack .spotifyalbum .spotifydl` | `/spotify/track/:id`, `/spotify/album/:id`, `/spotify/download` |
| `.wiki .countryinfo .imagesearch .newssearch .githubsearch .npmsearch .pypisearch .stackoverflow .redditsearch .urbandictionary .emojisearch` | `/search/*` |

> The Wolvarex API is not publicly documented. Response parsing is deliberately tolerant (`lib/api/normalize.js`), and when a response can't be understood the *key structure only* is written to the server log so the mapping can be adjusted.

## Local development

```bash
npm run check           # syntax-check every file
npm run audit:imports   # missing files / undeclared packages
npm test                # unit tests (mocked network, no WhatsApp needed)
npm run verify          # all of the above
npm run dev             # restart on file changes
```

Project layout:

```
commands/<category>/   one file per command (folder = menu category)
lib/api/               Wolvarex client + music / ai / fun / tools / upload / social / convert
lib/menu/              menu model, 6 views, 8 styles, ads
lib/plugins/           fault-tolerant loader (+ live reload)
lib/helpers/           reply, media, image processing, AFK, factories
lib/utils/             errors, redact, logger, http, SSRF guard, safe paths
config/                environment-driven configuration
deployment/            entrypoint, Koyeb spec, panel/troubleshooting guides
tests/                 node:test suites
```

## Deployment

### Docker

```bash
cp .env.example .env         # fill in SESSION_ID and WOLVAREX_API_KEY
docker compose up -d --build
docker compose logs -f
```

The image runs the bot as the unprivileged `node` user (via `gosu` after fixing volume permissions), forwards `SIGTERM/SIGINT` with `tini` for a graceful shutdown, and exposes `/health` (also `/healthz`) for health checks. Keep `/app/session` and `/app/data` on volumes (compose does this).

### Fly.io

```bash
fly launch --no-deploy --copy-config      # choose your own app name and region
fly volumes create paxton_data --size 1   # same region as the app
fly secrets set SESSION_ID="PAXTON-MD:..." WOLVAREX_API_KEY="your_api_key_here"
fly deploy
```

`fly.toml` mounts one volume at `/persist`; the entrypoint keeps `data/` and `session/` on it. Machines never auto-stop, so the bot stays connected.

### Koyeb

Create a **Web Service** from your Git repo with the **Dockerfile** builder, port `3000` (HTTP), health check path `/health`, and add `SESSION_ID` / `WOLVAREX_API_KEY` as secrets. `deployment/koyeb.yaml` lists the same settings for the CLI. The free tier has no persistent volume — use `SESSION_ID` login and expect settings to reset on redeploy.

### Render, Railway, Heroku-style hosts, VPS, panels

Any host that runs `npm install && npm start` works: set the environment variables above, expose `PORT`, and use `/health` as the health check. `render.yaml` and `Procfile` are included; see `deployment/DEPLOY-PANEL.md` for Pterodactyl panels. Use pm2/systemd on a VPS.

## Security notes

- **Rotate any API key that was ever committed or shared.** The archive this release was cleaned from shipped a `.env` containing an API key; it has been removed and `.env` is now git-ignored, but the old key must be considered exposed.
- **Anything pasted into a chat with an AI assistant should be treated as exposed** — if a real API key is ever shown in a conversation (even to ask "add these endpoints"), rotate it afterwards. Secrets are read only from the environment. Outgoing chat messages and logs are passed through a redactor that removes configured secrets, `key=`/`token=` values, bearer tokens and server paths.
- User- or API-supplied URLs go through an SSRF guard: http(s) only, ports 80/443, no credentials, DNS results must be public addresses, redirects are re-validated hop by hop.
- Privileged commands: `.eval`, `.update`, `.restart`, `.shutdown`, `.leaveall`, `.join`, `.gitclone`, `.forwardmsg`, `.factoryreset`, `.setowner`, `.resetowner`, `.addwhitelist`, `.removewhitelist` and **every DEV command** are **owner-only — sudo users are not enough**. `.cat/.ls/.download` cannot touch `.env`, `session/`, `owner.json`, `.git`, `node_modules` or symlinks pointing outside the project.
- Developer commands and the `$` dev shortcut are restricted to `27797352930` (WhatsApp: +27 797 352 930).
- `AUTO_JOIN_GROUP` is off unless you opt in.
- Known limit: DNS is resolved by the SSRF guard and again by the HTTP client, so a hostile DNS server could still race the check.

## Troubleshooting

| Symptom | Fix |
|---|---|
| API commands missing from `.menu` | `WOLVAREX_API_KEY` is not set (owners still see them flagged ⚠️). Run `.devcheck`. |
| `.play` says "Request failed" | Check the server log (`LOG_LEVEL=debug` shows the response *shape*). Try `.songs <name>` to see the search step alone. |
| `.setbotpp` says image processing is unavailable | The host can't load `sharp` (common on Termux/Alpine/panels). Run `npm install sharp jimp` (or `npm rebuild sharp`), or install `ffmpeg`. `.devcheck` shows which backends load. |
| `npm install` fails on a panel | See `deployment/DEPLOY_TROUBLESHOOTING.md`. |
| Bot exits at start with "No SESSION_ID" | There is no terminal to type a pairing number into — set `SESSION_ID`. |
| A command doesn't appear | `.plugins failed` lists files that failed to load and why. `.reloadplugins` re-scans without a restart. |

## Credits & licence

MIT — see `LICENSE`. Built on Baileys.
