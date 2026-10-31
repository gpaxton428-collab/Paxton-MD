import { sendReaction } from '../../lib/helpers/reactionCommand.js';

export default {
  name: 'cuddle',
  description: 'Anime reaction GIF. Usage: .cuddle [@user or reply]',
  async execute(sock, msg) { return sendReaction(sock, msg, 'cuddle'); }
};
