# Paxton Tech

A WhatsApp bot built on Baileys.

## Quick start

```bash
npm install
```

Then either:
- Paste a session string into `session_id.txt` (or set `SESSION_ID` in `.env` / your host's environment variables), or
- Run `npm start` and follow the interactive pairing-code login.

## Getting a session string

Run the session generator (a separate small web app included in this project):

```bash
npm run session-generator
```

Open the URL it prints, enter your WhatsApp number, and follow the pairing steps. It'll give you a `PAXTON-TECH:...` string — put that in `SESSION_ID`.

## Owner

The default owner is `27797352930`. Set `OWNER_NUMBER` in `.env` (or your host's environment variables) to use a different number. It is only applied on first boot, when `owner.json` doesn't exist yet; after that use `.setowner`.

## Requirements

Node.js 20.18.1 or newer (Baileys 7.0.0-rc14).

## Configuration

Copy `.env.example` to `.env` and fill in what you need. See that file for what each setting does. **Never commit your real `.env`** — it's already in `.gitignore`.

## Commands

Run `.menu` (or `.help`) once the bot is connected to see everything available, organized by category.

## Deploying

- **Render**: `render.yaml` is included — connect the repo and Render will pick it up.
- **Panel hosts** (Katabump, bot-hosting.net, etc.): use the `session_id.txt` file if the panel doesn't support custom environment variables.
