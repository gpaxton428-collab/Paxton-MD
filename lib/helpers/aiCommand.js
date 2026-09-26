// Factory for the single-provider AI chat commands (.claude, .mistral, ...).
import { askAi } from '../api/ai.js';
import { react, reply, replyError, usage } from './reply.js';

export function createAiCommand({ name, provider, alias = [], label }) {
  return {
    name, alias,
    description: `Ask ${label || provider} (Wolvarex API). Usage: .${name} <question>`,
    requires: ['WOLVAREX_API_KEY'],
    async execute(sock, msg, args, prefix) {
      const chatId = msg.key.remoteJid;
      if (!args.length) return reply(sock, msg, usage(prefix, `${name} <question>`, `${name} explain black holes simply`));
      try {
        sock.sendPresenceUpdate('composing', chatId).catch(() => {});
        const text = await askAi(provider, args.join(' '));
        await reply(sock, msg, text);
      } catch (err) {
        await replyError(sock, msg, err, name);
      } finally {
        sock.sendPresenceUpdate('paused', chatId).catch(() => {});
      }
    }
  };
}
