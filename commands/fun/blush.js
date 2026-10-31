import { sendReaction } from '../../lib/helpers/reactionCommand.js';

export default {
  name: 'blush',
  description: 'Anime reaction GIF. Usage: .blush [@user or reply]',
  async execute(sock, msg) { return sendReaction(sock, msg, 'blush'); }
};
