import { sendReaction } from '../../lib/helpers/reactionCommand.js';

export default {
  name: 'bite',
  description: 'Anime reaction GIF. Usage: .bite [@user or reply]',
  async execute(sock, msg) { return sendReaction(sock, msg, 'bite'); }
};
