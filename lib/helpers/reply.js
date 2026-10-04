// Consistent reply helpers so every command talks the same way.
import { toUserMessage } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export const jidOf = (msg) => msg.key.remoteJid;
export const senderOf = (msg) => msg.key.participant || msg.key.remoteJid;

export function reply(sock, msg, text, extra = {}) {
  return sock.sendMessage(msg.key.remoteJid, { text, ...extra }, { quoted: msg });
}
export function react(sock, msg, emoji) {
  return sock.sendMessage(msg.key.remoteJid, { react: { text: emoji, key: msg.key } }).catch(() => {});
}
export function usage(prefix, syntax, example) {
  return `❌ *Usage:* ${prefix}${syntax}${example ? `\n💡 *Example:* ${prefix}${example}` : ''}`;
}
// Logs the technical error, tells the user something safe.
export async function replyError(sock, msg, err, scope = 'command') {
  logger.error(scope, err);
  try { await react(sock, msg, '❌'); await reply(sock, msg, toUserMessage(err)); } catch { /* chat may be gone */ }
}
