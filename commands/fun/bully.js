import { sendReaction } from '../../lib/helpers/reactionCommand.js';

export default {
  name: 'bully',
  description: 'Anime reaction GIF. Usage: .bully [@user or reply]',
  async execute(sock, msg) { return sendReaction(sock, msg, 'bully'); }
};
