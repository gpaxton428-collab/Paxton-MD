// Shared atomic JSON writer. Every bit of bot state that lives in a
// JSON file (settings, blocklist, AFK state, etc.) should save through
// this instead of fs.writeFileSync directly: writing straight to the
// target file means a crash, power loss, or panel OOM-kill mid-write
// can leave a half-written, corrupted file that breaks the bot on next
// boot. Writing to a temp file first and renaming it into place is
// atomic on POSIX and Windows, so every read only ever sees a fully
// old or fully new file.
import fs from 'fs';
import path from 'path';

export function writeJsonSync(file, data) {
  const dir = path.dirname(file);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, file);
}
