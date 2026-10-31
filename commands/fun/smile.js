import { sendReaction } from '../../lib/helpers/reactionCommand.js';

export default {
  name: 'smile',
  description: 'Anime reaction GIF. Usage: .smile [@user or reply]',
  async execute(sock, msg) { return sendReaction(sock, msg, 'smile'); }
};
