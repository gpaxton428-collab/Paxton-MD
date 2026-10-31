import { sendReaction } from '../../lib/helpers/reactionCommand.js';

export default {
  name: 'kiss',
  description: 'Anime reaction GIF. Usage: .kiss [@user or reply]',
  async execute(sock, msg) { return sendReaction(sock, msg, 'kiss'); }
};
