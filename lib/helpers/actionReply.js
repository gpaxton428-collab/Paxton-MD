import { sendInteractive, quickButton } from './interactive.js';

/** Send a native-flow action row with a safe text fallback. */
export async function replyWithActions(sock, msg, text, actions = [], footer = '⚡ Paxton-Tech • Tap an action or use the command') {
  const buttons = actions
    .filter((a) => a && a.text && a.id)
    .slice(0, 3)
    .map((a) => quickButton(a.text, a.id));
  if (!buttons.length) return sock.sendMessage(msg.key.remoteJid, { text }, { quoted: msg });
  return sendInteractive(sock, msg.key.remoteJid, {
    text,
    footer,
    buttons,
    fallbackText: `${text}\n\n${actions.map((a) => `↳ ${a.id}`).join('   ')}`
  }, { quoted: msg });
}

export const antiActions = (prefix, command) => [
  { text: '🟢 ON', id: `${prefix}${command} on` },
  { text: '🔴 OFF', id: `${prefix}${command} off` },
  { text: 'ℹ️ Status', id: `${prefix}${command}` }
];
