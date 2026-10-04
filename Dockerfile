# syntax=docker/dockerfile:1
# ---------- build stage: install production dependencies ----------
FROM node:20-bookworm-slim AS deps
WORKDIR /app
# git is only needed at install time (some Baileys sub-dependencies resolve from git)
RUN apt-get update && apt-get install -y --no-install-recommends git ca-certificates python3 make g++ \
    && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json* .npmrc ./
RUN npm install --omit=dev --no-audit --no-fund && npm cache clean --force

# ---------- runtime stage ----------
FROM node:20-bookworm-slim AS runtime
ENV NODE_ENV=production \
    PORT=3000 \
    TZ=UTC
# ffmpeg: media/sticker conversions + image-processing fallback. tini: correct signal handling / zombie reaping.
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg tini gosu ca-certificates curl \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --chown=node:node . .
COPY --chmod=755 deployment/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
# Writable runtime state (mount volumes on these to persist across redeploys)
RUN mkdir -p /app/data /app/session /app/temp_sessions && chown -R node:node /app
# The entrypoint fixes volume ownership and then runs the bot as the unprivileged "node" user (gosu).
EXPOSE 3000
VOLUME ["/app/data", "/app/session"]
HEALTHCHECK --interval=30s --timeout=5s --start-period=45s --retries=3 \
  CMD curl -fsS "http://127.0.0.1:${PORT}/health" || exit 1
# tini forwards SIGTERM/SIGINT to node, which shuts the bot down gracefully (see index.js)
ENTRYPOINT ["/usr/bin/tini", "--", "/usr/local/bin/docker-entrypoint.sh"]
CMD ["node", "index.js"]
