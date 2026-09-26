import { askAi } from '../../lib/api/ai.js';
import { react, reply, replyError, usage } from '../../lib/helpers/reply.js';

export default {
  name: 'llamachat',
  alias: ['llama'],
  description: 'Ask the Wolvarex-hosted Llama endpoint. Usage: .llamachat <question>',
  requires: ['WOLVAREX_API_KEY'],
  async execute(sock, msg, args, prefix) {
    const chatId = msg.key.remoteJid;
    if (!args.length) return reply(sock, msg, usage(prefix, 'llamachat <question>', 'llamachat explain black holes simply'));
    try {
      sock.sendPresenceUpdate('composing', chatId).catch(() => {});
      const text = await askAi('llama', args.join(' '));
      await reply(sock, msg, text);
    } catch (err) {
      await replyError(sock, msg, err, 'llamachat');
    } finally {
      sock.sendPresenceUpdate('paused', chatId).catch(() => {});
    }
  }
};
