// Text builders for .ping and .runtime.
// The "Forwarded many times" label is set on the outgoing message itself
// (see lib/helpers/forwarded.js, BOT_FORWARDED_TAG). BOT_NOTICE_LINE can
// still add an optional plain-text line above the result (default: none).
import os from 'os';
import { config, envString } from '../../config/index.js';
import { formatRuntimeHMS } from '../utils/format.js';
import { replyForwarded } from './forwarded.js';

export function noticeLine() {
  const v = envString('BOT_NOTICE_LINE', 'off');
  return /^(off|none|false|0)$/i.test(v) ? '' : v;
}

const withNotice = (body) => { const n = noticeLine(); return n ? `${n}\n\n${body}` : body; };
const isOnline = (ctx) => (ctx.isWhatsAppConnected ? ctx.isWhatsAppConnected() : true);

export function buildPingText(ctx, ms) {
  return withNotice([
    '🏓 *PONG*',
    '',
    `⚡ Response: ${ms} ms`,
    `⏱️ Runtime: ${formatRuntimeHMS(process.uptime())}`,
    `📦 Plugins: ${ctx.getTotalCommandCount()}`,
    `${isOnline(ctx) ? '🟢 Status: ONLINE' : '🔴 Status: OFFLINE'}`
  ].join('\n'));
}

export function buildRuntimeText(ctx) {
  return withNotice([
    '⏱️ *RUNTIME*',
    '',
    `⏱️ Uptime: ${formatRuntimeHMS(process.uptime())}`,
    `${isOnline(ctx) ? '🟢 Status: ONLINE' : '🔴 Status: OFFLINE'}`,
    `📦 Plugins: ${ctx.getTotalCommandCount()}`,
    `💾 Memory: ${Math.round(process.memoryUsage().rss / 1048576)} MB of ${Math.round(os.totalmem() / 1048576)} MB`,
    `🖥️ Host: ${config.platform}`,
    `🏷️ Version: v${ctx.VERSION}`
  ].join('\n'));
}

// Sends "pinging…", measures the round trip, then sends the result with the
// forwarded label and removes the placeholder (an edit cannot carry the label).
export async function runPing(sock, msg, ctx) {
  const chatId = msg.key.remoteJid;
  const start = Date.now();
  const sent = await sock.sendMessage(chatId, { text: '🏓 Pinging…' }, { quoted: msg });
  const ms = Date.now() - start;
  await replyForwarded(sock, msg, buildPingText(ctx, ms));
  if (sent?.key) await sock.sendMessage(chatId, { delete: sent.key }).catch(() => {});
}
