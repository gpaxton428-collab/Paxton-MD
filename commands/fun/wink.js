import { sendReaction } from '../../lib/helpers/reactionCommand.js';

export default {
  name: 'wink',
  description: 'Anime reaction GIF. Usage: .wink [@user or reply]',
  async execute(sock, msg) { return sendReaction(sock, msg, 'wink'); }
};
