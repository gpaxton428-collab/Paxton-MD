// Text builders for .ping and .runtime.
// The "forwarded" line is plain text written by the bot itself. It does NOT
// set isForwarded / forwardingScore / newsletter metadata, so it cannot be
// mistaken for a real WhatsApp forwarded-message label. Change or disable it
// with BOT_NOTICE_LINE (set to "off" to hide it).
import os from 'os';
import { config, envString } from '../../config/index.js';
import { formatRuntimeHMS } from '../utils/format.js';
import { sendInteractive, quickButton } from './interactive.js';

export function noticeLine() {
  const v = envString('BOT_NOTICE_LINE', 'off');
  return /^(off|none|false|0)$/i.test(v) ? '' : v;
}

const withNotice = (body) => { const n = noticeLine(); return n ? `${n}\n\n${body}` : body; };
const isOnline = (ctx) => (ctx.isWhatsAppConnected ? ctx.isWhatsAppConnected() : true);

export function buildPingText(ctx, ms) {
  return withNotice([
    '╭━━〔 ⚡ PAXTON-MD 〕━━╮',
    '│',
    '│ 🏓 *PONG*',
    `│ ⚡ Speed: *${ms}ms*`,
    `│ ${isOnline(ctx) ? '🟢' : '🔴'} Status: *${isOnline(ctx) ? 'ONLINE' : 'OFFLINE'}*`,
    `│ ⏱️ Runtime: ${formatRuntimeHMS(process.uptime())}`,
    `│ 📦 Plugins: ${ctx.getTotalCommandCount()}`,
    '│',
    '╰━━━━━━━━━━━━━━━━━━╯'
  ].join('\n'));
}

export function buildRuntimeText(ctx) {
  return withNotice([
    '╭━━〔 ⚡ PAXTON-MD 〕━━╮',
    '│',
    '│ 🟢 *ALIVE*',
    `│ ⏱️ Runtime: *${formatRuntimeHMS(process.uptime())}*`,
    `│ ${isOnline(ctx) ? '🟢' : '🔴'} Status: *${isOnline(ctx) ? 'ONLINE' : 'OFFLINE'}*`,
    `│ 📦 Plugins: ${ctx.getTotalCommandCount()}`,
    `│ 💾 RAM: ${Math.round(process.memoryUsage().rss / 1048576)} MB`,
    `│ 🖥️ Host: ${config.platform}`,
    `│ 🏷️ Version: v${ctx.VERSION}`,
    '│',
    '╰━━━━━━━━━━━━━━━━━━╯'
  ].join('\n'));
}

// Send ONE final message. The old implementation sent a temporary message,
// edited it, then sent a second interactive message, which is why `.ping`
// appeared twice in chat. The measured value below is the send-path latency.
export async function runPing(sock, msg, ctx) {
  const chatId = msg.key.remoteJid;
  const contextInfo = ctx.channelContextInfo ? ctx.channelContextInfo() : undefined;
  const start = Date.now();
  const text = buildPingText(ctx, 0);
  const prefix = ctx.getCurrentPrefix ? ctx.getCurrentPrefix() : '.';
  const sent = await sendInteractive(sock, chatId, {
    text,
    footer: '⚡ Paxton-Tech • Quick actions',
    buttons: [
      quickButton('🟢 Alive', `${prefix}alive`),
      quickButton('📦 Repo', `${prefix}repo`),
      quickButton('🏠 Menu', `${prefix}menu`)
    ],
    fallbackText: text,
    contextInfo
  }, { quoted: msg });
  const ms = Date.now() - start;
  // Do not send a second message just to update the number. If the returned
  // message can be edited, update the same message; otherwise leave it at 0ms
  // rather than duplicating the command response.
  if (sent?.key && ms > 0) {
    try { await sock.sendMessage(chatId, { text: buildPingText(ctx, ms), edit: sent.key, contextInfo }, { quoted: msg }); } catch {}
  }
  return sent;
}

export async function sendRuntime(sock, msg, ctx) {
  const chatId = msg.key.remoteJid;
  const prefix = ctx.getCurrentPrefix ? ctx.getCurrentPrefix() : '.';
  const text = buildRuntimeText(ctx);
  return sendInteractive(sock, chatId, {
    text,
    footer: '⚡ Paxton-Tech • Runtime actions',
    buttons: [
      quickButton('🏓 Ping', `${prefix}ping`),
      quickButton('🔄 Refresh', `${prefix}runtime`),
      quickButton('🏠 Menu', `${prefix}menu`)
    ],
    fallbackText: text
  }, { quoted: msg });
}
