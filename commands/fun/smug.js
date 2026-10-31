import { sendReaction } from '../../lib/helpers/reactionCommand.js';

export default {
  name: 'smug',
  description: 'Anime reaction GIF. Usage: .smug [@user or reply]',
  async execute(sock, msg) { return sendReaction(sock, msg, 'smug'); }
};
