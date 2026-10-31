import { sendReaction } from '../../lib/helpers/reactionCommand.js';

export default {
  name: 'slap',
  description: 'Anime reaction GIF. Usage: .slap [@user or reply]',
  async execute(sock, msg) { return sendReaction(sock, msg, 'slap'); }
};
