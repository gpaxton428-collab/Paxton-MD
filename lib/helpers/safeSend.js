// Wraps sock.sendMessage once so EVERY outgoing text/caption passes through
// redact() — a global safety net against API keys, tokens or server paths
// leaking through an error message.
import { redact } from '../utils/redact.js';

export function wrapSendMessageWithRedaction(sock) {
  const original = sock.sendMessage.bind(sock);
  sock.sendMessage = (jid, content, options) => {
    try {
      if (content && typeof content === 'object') {
        const patch = {};
        for (const field of ['text', 'caption']) if (typeof content[field] === 'string') patch[field] = redact(content[field]);
        if (Object.keys(patch).length) content = { ...content, ...patch };
      }
    } catch { /* never block a send because of the filter */ }
    return original(jid, content, options);
  };
}
