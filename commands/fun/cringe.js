import { sendReaction } from '../../lib/helpers/reactionCommand.js';

export default {
  name: 'cringe',
  description: 'Anime reaction GIF. Usage: .cringe [@user or reply]',
  async execute(sock, msg) { return sendReaction(sock, msg, 'cringe'); }
};
