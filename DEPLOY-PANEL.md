# Deploying on panel hosts (Katabump, bot-hosting.net, and similar)

These are Pterodactyl-based panels — the exact menu wording can vary
between them, but the flow is the same everywhere:

## 1. Create the server
- Choose a **Node.js** egg/template (sometimes called "Generic Node.js"
  or "NodeJS Application").
- Node version: 18 or higher.

## 2. Upload the code
Either:
- Upload `Paxton-MD.zip` through the panel's File Manager and extract it, or
- If the panel supports it, use its "Install from Git" / repository field
  with this URL: `https://github.com/gpaxton428-collab/Paxton-MD.git`

Either way, the panel's **root directory** should end up containing
`index.js`, `package.json`, etc. directly (not nested one folder deeper —
if extracting the zip creates a `Paxton-MD/` subfolder, move its
contents up to the root).

## 3. Set the startup command
`npm start` (or `node index.js` if the panel wants the raw command
instead of an npm script).

## 4. Install dependencies
Most panels do `npm install` automatically on first boot. If yours
doesn't, run it from the panel's console:
```
npm install
```

## 5. Set your session
Get a session string from the session generator (see main README), then
either:
- **If the panel has an environment variables / "Startup Variables"
  section**: add `SESSION_ID` = `PAXTON-MD:...`
- **If it doesn't** (common on free tiers of Katabump, bot-hosting.net,
  etc.): open `session_id.txt` in the File Manager and paste your
  session string on its own line, replacing the comment block. The bot
  checks this file automatically if no `SESSION_ID` env var is set.

## 6. Start the server
The console should show the bot connecting. If it instead shows the
interactive login menu (numbered options) and then appears to hang,
that almost always means neither `SESSION_ID` nor `session_id.txt` was
picked up — double check step 5.

## Notes specific to these hosts
- Free-tier panels often reclaim idle/inactive servers or restart them
  periodically — this is a hosting-provider policy, not something the
  bot's code controls.
- Disk usually persists across restarts (unlike some free web-service
  platforms), so once you're logged in with a session string you
  shouldn't need to re-pair after restarts — only after the panel
  wipes the server entirely.
- If custom env vars genuinely aren't available on your plan, the
  `session_id.txt` fallback above is the way around that — it's
  checked by the exact same login code path as the env var.
