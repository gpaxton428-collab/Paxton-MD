## 2.8.4

- Based on the v2.8.2 codebase, preserving the working button implementation.
- Upgraded `@whiskeysockets/baileys` to 7.0.0-rc14.
- Added Baileys retry counter cache and placeholder-resend handling.
- Fixed `getMessage()` to return message content instead of the outer WAMessage wrapper.
- Menu style 1 now uses one command per line for every category, including SUDO, TOOLS, USER, UTILITY and MENU STYLE.
- UTILITY menu keeps the requested 50-command straight-down list.
- `.menu` now targets one image + caption + native buttons message.
- `.ping` no longer sends a temporary + final + button message chain.
- `.runtime` now has interactive buttons.
- Added lightweight atomic database layer, database health/backup commands, CI and deployment docs.

# Changelog

## 2.6.0 — Paxton MD V2 clean release

**API layer**: single Wolvarex client (`lib/api/`) with timeouts, retry, redaction and tolerant response parsing; music, AI, fun, upload, search, screenshot, weather, Instagram and converter endpoints all use it. Fun commands fall back to their offline lists.
**Fixed**: `.play` rewritten on `/music/ytmp3-search` → `/music/ytmp3-download` with audio validation; `.setbotpp` no longer depends on Baileys' image library (also fixes `.groupicon`); API key was read before `.env` was loaded (empty key when supplied via `.env`); `watermark` imported an undeclared `jimp`; duplicate/dead code in ping/runtime.
**Menus**: text-only, six views × eight styles, ads block (`.setmenuads`), new USER / DOWNLOAD / SEARCH / UTILITY categories. Button menus and the `gifted-btns` / `my-md-btns` dependencies were removed.
**New commands**: `userinfo profile avatar afk reminder usermenu songs plugins reloadplugins setmenuads` and menu shortcuts per category.
**Security**: no secrets in the repo, SSRF guard, sandboxed file commands, strict-owner tier, `.eval`/`.update`/auto-join opt-in, hard-coded developer-number shortcut replaced by `DEV_NUMBERS`, global output redaction.
**Ops**: Dockerfile, compose, Fly.io, Koyeb, graceful SIGTERM, `/health` + `/healthz`, unit tests.
**Removed**: `.buttonmenu`, `.buttontest`, `.video` (guessed endpoints), `wouldyourather2`, unused deps (`pino`, `dotenv`).

## 2.7.0

**`.play`**: metadata card (title, artist, release date, views, duration) that is edited in place through Searching → Downloading → Done before the audio is sent.
**Fixed**: chatbot no longer replies to the bot's own outgoing DMs (missing `fromMe` guard); added short per-user conversation memory (`.clearmemory` to reset); confirmed the existing global `uncaughtException`/`unhandledRejection` handlers (log-only, never exit) already stop "Bad MAC"/decrypt errors from crashing the process — see index.js.
**New**: `.autostatusreact` + `.setstatusreactemoji` (auto-react to contacts' status updates); reaction-triggered view-once capture — react to a view-once photo/video with any emoji to get a private copy, toggled with `.setvvreact`; the channel "View Channel" chip (same as `.alive`) now also shows on `.menu`, `.ping`, `.runtime`.
**Hosting**: `.envcheck` now shows whether each key/`SESSION_ID` came from a real host environment variable (survives redeploys) or only from a `.env`/`session_id.txt` file (wiped by panels, e.g. Katabump, that fully re-clone the repo on every deploy) — set secrets as real panel "Environment Variables" for them to survive a `git push`.

## 2.8.0

**New Wolvarex integrations** (all under `WOLVAREX_API_KEY`, none hard-coded):
- **AI**: 33 more single-provider chat commands — `.claude`, `.mistral`, `.gemini`, `.deepseek`, `.venice`, `.cohere`, `.mixtral`, `.phi`, `.qwen`, `.falcon`, `.vicuna`, `.openchat`, `.wizard`, `.zephyr`, `.codellama`, `.starcoder`, `.dolphin`, `.nous`, `.openhermes`, `.neural`, `.solar`, `.yi`, `.tinyllama`, `.orca`, `.command`, `.nemotron`, `.internlm`, `.chatglm`, `.blackbox`, `.replit`, `.notegpt`, `.notegptdeepseek`, `.notegptpro`. `wormgpt` was in the endpoint list provided but is intentionally **not** integrated — it's marketed as an uncensored model for malware/phishing generation.
- **Shazam**: `.shazam` (reply to a voice note/audio clip), `.shazamsearch`, `.shazamtrack`.
- **Spotify**: `.spotifytrack`, `.spotifyalbum`, `.spotifydl`.
- **Search**: `.wiki`, `.countryinfo`, `.imagesearch`, `.newssearch`, `.githubsearch`, `.npmsearch`, `.pypisearch`, `.stackoverflow`, `.redditsearch`, `.urbandictionary`, `.emojisearch`.
- **Converter**: `.urltosticker` (image URL → sticker; for an attached image use the existing `.imgtosticker`).

**Security note**: an earlier message in this project's chat history pasted a live Wolvarex API key in plain text. It was never written into any file — rotate it in the Wolvarex dashboard regardless, since anything typed into a chat should be treated as exposed.
