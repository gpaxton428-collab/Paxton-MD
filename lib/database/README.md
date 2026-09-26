# Paxton-MD database layer

This is a lightweight atomic JSON database layer for bot state that should survive restarts without adding a native SQLite build dependency.

- Runtime files live under `data/database/` and are ignored by Git.
- Writes use a temporary file + rename to avoid half-written JSON.
- `dbBackup()` creates timestamped backups.
- `dbStats()` reports database size.

WhatsApp auth/session files remain separate under `session/` and must never be committed.
