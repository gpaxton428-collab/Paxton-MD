import { sendReaction } from '../../lib/helpers/reactionCommand.js';

export default {
  name: 'nom',
  description: 'Anime reaction GIF. Usage: .nom [@user or reply]',
  async execute(sock, msg) { return sendReaction(sock, msg, 'nom'); }
};
