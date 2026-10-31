import { REACTIONS, sendReaction } from '../../lib/helpers/reactionCommand.js';
import { reply } from '../../lib/helpers/reply.js';

export default {
  name: 'reactions',
  alias: ['reaction'],
  description: 'List anime reactions, or send one. Usage: .reactions | .reactions <name> [@user or reply]',
  async execute(sock, msg, args, prefix) {
    const kind = (args[0] || '').toLowerCase();
    if (REACTIONS[kind]) return sendReaction(sock, msg, kind);
    await reply(sock, msg, `🎭 *Anime reactions*\n\n${Object.keys(REACTIONS).map((k) => `• ${prefix}${k}`).join('\n')}\n\nTag or reply to someone: ${prefix}hug @user`);
  }
};
