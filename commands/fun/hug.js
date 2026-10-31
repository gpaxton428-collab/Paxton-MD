import { sendReaction } from '../../lib/helpers/reactionCommand.js';

export default {
  name: 'hug',
  description: 'Anime reaction GIF. Usage: .hug [@user or reply]',
  async execute(sock, msg) { return sendReaction(sock, msg, 'hug'); }
};
