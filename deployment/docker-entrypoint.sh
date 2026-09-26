#!/bin/sh
# Prepares writable state directories, then drops root privileges.
#  - PERSIST_DIR (e.g. a Fly.io volume mounted at /persist): data/ and session/
#    live inside it so a single volume keeps settings AND the WhatsApp session.
set -e
APP_DIR="${APP_DIR:-/app}"

if [ "$(id -u)" = "0" ]; then
  if [ -n "$PERSIST_DIR" ]; then
    mkdir -p "$PERSIST_DIR/data" "$PERSIST_DIR/session"
    for d in data session; do
      if [ ! -L "$APP_DIR/$d" ]; then
        # first run: keep anything already in the image dir, then replace it with a link
        cp -an "$APP_DIR/$d/." "$PERSIST_DIR/$d/" 2>/dev/null || true
        rm -rf "$APP_DIR/$d"
        ln -s "$PERSIST_DIR/$d" "$APP_DIR/$d"
      fi
    done
    chown -R node:node "$PERSIST_DIR"
  else
    mkdir -p "$APP_DIR/data" "$APP_DIR/session" "$APP_DIR/temp_sessions"
    chown -R node:node "$APP_DIR/data" "$APP_DIR/session" "$APP_DIR/temp_sessions"
  fi
  exec gosu node "$@"
fi
exec "$@"
