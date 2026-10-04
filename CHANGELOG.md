## 2.8.0
- Paxton MD cleanup build.
- Pinned Baileys to 6.7.24.
- Removed optional Jimp dependency.
- Developer contact updated to +27797352930.
- 371 unique command modules retained and verified by the command loader/tests.
- Group protection includes 10+ anti-* commands.

# Changelog

## 2.9.0
- License changed from MIT to a source-available license (see `LICENSE`).
- Added `lib/remote.js` and `.pro` for hosted features served from your own license-key API.
- Menu header image now rotates through bundled pictures in `assets/menu/` (on by default).
- Session generator page redesigned: responsive layout with an image showcase, deploy guide tab.
- Heroku: `Procfile` runs a web dyno, `app.json` added (Node.js + FFmpeg buildpacks).
- Panels: `SERVER_PORT` is used when `PORT` is unset; `session_id.txt` template; saved sessions are no longer overwritten on every restart; web server errors no longer affect the bot.

## 2.6.1

**Menus**: every command is listed on its own line under its category (Tools → .ping / .runtime / …) in all eight styles. New `.adstag` sets the label above the menu ad (`MENU_ADS_TAG`); `.setmenuads` and `.reloadconfig` show it. The menu message also carries a WhatsApp-style "Ad" badge (`.adstag badge on|off`).
**Status replies**: `.ping`, `.runtime`, `.alive`, `.botinfo`, `.version`, `.stats`, `.sysinfo`, `.botcore` carry a cosmetic "Forwarded many times" label (`BOT_FORWARDED_TAG=off` to hide). `.ping` now sends the result as a new message and removes the "Pinging…" placeholder, because an edit cannot carry the label.
**Dev commands**: `uptime2.js` renamed to `processinfo.js`; all dev commands are `strictOwner` (hidden from sudo users who cannot run them); `.fixsettings` keeps a `.bak` copy; `.npm` only accepts package names and `--depth/--json/--long`; `.devcheck`/`.errorlog` cope with errors that have no scope; `.botcore` uses the same runtime format as `.ping`; wrong "$-prefix" wording removed.

## 2.6.0 — Paxton MD V2 clean release

**API layer**: single Wolvarex client (`lib/api/`) with timeouts, retry, redaction and tolerant response parsing; music, AI, fun, upload, search, screenshot, weather, Instagram and converter endpoints all use it. Fun commands fall back to their offline lists.
**Fixed**: `.play` rewritten on `/music/ytmp3-search` → `/music/ytmp3-download` with audio validation; `.setbotpp` no longer depends on Baileys' image library (also fixes `.groupicon`); API key was read before `.env` was loaded (empty key when supplied via `.env`); `watermark` imported an undeclared `jimp`; duplicate/dead code in ping/runtime.
**Menus**: text-only, six views × eight styles, ads block (`.setmenuads`), new USER / DOWNLOAD / SEARCH / UTILITY categories. Button menus and the `gifted-btns` / `my-md-btns` dependencies were removed.
**New commands**: `userinfo profile avatar afk reminder usermenu songs plugins reloadplugins setmenuads` and menu shortcuts per category.
**Security**: no secrets in the repo, SSRF guard, sandboxed file commands, strict-owner tier, `.eval`/`.update`/auto-join opt-in, hard-coded developer-number shortcut replaced by `DEV_NUMBERS`, global output redaction.
**Ops**: Dockerfile, compose, Fly.io, Koyeb, graceful SIGTERM, `/health` + `/healthz`, unit tests.
**Removed**: `.buttonmenu`, `.buttontest`, `.video` (guessed endpoints), `wouldyourather2`, unused deps (`pino`, `dotenv`).
