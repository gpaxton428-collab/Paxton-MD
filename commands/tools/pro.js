// Gateway to hosted (server-side) premium commands: .pro <name> [text]
// Add new premium features on the server (paxton-api/handlers) - no bot update needed.
import { callRemote } from '../../lib/remote.js';
import { reply, react, usage } from '../../lib/helpers/reply.js';

export default {
  name: 'pro',
  description: 'Run a hosted premium command. Usage: .pro <name> [text]  (try: .pro list)',
  async execute(sock, msg, args, prefix) {
    const name = (args[0] || '').toLowerCase();
    if (!name) return reply(sock, msg, usage(prefix, 'pro <name> [text]', 'pro list'));
    try {
      await react(sock, msg, '⏳');
      const out = await callRemote(name, { args: args.slice(1), text: args.slice(1).join(' ') });
      await reply(sock, msg, out.text || '✅ Done.');
      await react(sock, msg, '✅');
    } catch (err) {
      await react(sock, msg, '❌');
      await reply(sock, msg, err.userSafe ? `❌ ${err.message}` : '❌ Premium server is unreachable right now.');
    }
  }
};
