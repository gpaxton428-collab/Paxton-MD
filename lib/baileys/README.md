# Paxton-MD Baileys integration

This folder isolates Baileys-specific support code. The project targets the current `@whiskeysockets/baileys` 7.0.0-rc14 line and keeps retry state outside the socket so reconnects do not reset message retry counters.

The main connection still uses multi-file auth under `session/`. Do not commit that directory.
