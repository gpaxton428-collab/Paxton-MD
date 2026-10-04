// Cosmetic "Forwarded many times" label for the bot's own status replies
// (.ping, .runtime, .alive, ...). It is a display tag set on the outgoing
// message (isForwarded + forwardingScore); it is not a real forward.
// Turn it off with BOT_FORWARDED_TAG=off.
import { envString } from '../../config/index.js';

export function forwardedEnabled() {
  return !/^(off|none|false|0|no)$/i.test(envString('BOT_FORWARDED_TAG', 'on'));
}

// Returns a contextInfo object (merged with `extra`), or undefined when there is nothing to attach.
export function forwardedContext(extra = {}) {
  const base = forwardedEnabled() ? { isForwarded: true, forwardingScore: 999 } : {};
  const merged = { ...base, ...(extra || {}) };
  return Object.keys(merged).length ? merged : undefined;
}

// Sends `text` as a quoted reply carrying the forwarded label.
export function replyForwarded(sock, msg, text, extra = {}) {
  const { contextInfo, ...rest } = extra;
  const ci = forwardedContext(contextInfo);
  return sock.sendMessage(msg.key.remoteJid, { text, ...(ci ? { contextInfo: ci } : {}), ...rest }, { quoted: msg });
}
