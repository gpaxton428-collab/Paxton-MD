// Factory for the URL-based converter commands.
import { convertFromUrl } from '../api/convert.js';
import { react, reply, replyError, usage } from './reply.js';

export function createConverterCommand({ name, path, description, input, send }) {
  return {
    name, description,
    requires: ['WOLVAREX_API_KEY'],
    async execute(sock, msg, args, prefix) {
      const url = args[0];
      if (!url) return reply(sock, msg, usage(prefix, `${name} <${input} url>`));
      try {
        await react(sock, msg, '🔄');
        const buffer = await convertFromUrl(path, url);
        await sock.sendMessage(msg.key.remoteJid, send(buffer), { quoted: msg });
        await react(sock, msg, '✅');
      } catch (err) { await replyError(sock, msg, err, name); }
    }
  };
}
