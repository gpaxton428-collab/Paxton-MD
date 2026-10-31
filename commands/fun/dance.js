import { sendReaction } from '../../lib/helpers/reactionCommand.js';

export default {
  name: 'dance',
  description: 'Anime reaction GIF. Usage: .dance [@user or reply]',
  async execute(sock, msg) { return sendReaction(sock, msg, 'dance'); }
};
