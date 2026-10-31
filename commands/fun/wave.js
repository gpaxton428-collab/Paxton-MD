import { sendReaction } from '../../lib/helpers/reactionCommand.js';

export default {
  name: 'wave',
  description: 'Anime reaction GIF. Usage: .wave [@user or reply]',
  async execute(sock, msg) { return sendReaction(sock, msg, 'wave'); }
};
