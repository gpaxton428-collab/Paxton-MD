# Deploy troubleshooting

## "failed to fetch" errors during npm install (bot-hosting.net, Katabump, etc.)

Free panels like these often have slow or restricted outbound network
access, which shows up as a generic "failed to fetch" during install on
larger packages (Baileys is the biggest dependency here, so it's usually
the one that surfaces the error even when it's really a general network
hiccup).

Try these in order:

1. **Delete and reinstall clean.** In the panel's console/terminal:
   ```
   rm -rf node_modules package-lock.json
   npm install
   ```
   A corrupted or half-downloaded `node_modules` from a previous failed
   install is the single most common cause.

2. **Confirm the panel's actual Node version.** Most panels have a
   Node version dropdown in their settings separate from this project's
   `package.json` — the `engines` field here is just a hint, most panels
   don't enforce it automatically. This project needs **Node 20+**. If
   the panel is defaulting to Node 16 or 18, some dependencies will fail
   to install or run correctly.

3. **Retry the install.** `.npmrc` in this project now gives npm more
   retries and a longer timeout before giving up — a single retry
   often succeeds where the first attempt times out.

4. **If it still fails**, copy the *exact* error text (not a paraphrase)
   from the panel's build/install log and share it — "failed to fetch"
   alone isn't enough to know which specific package or step failed.
