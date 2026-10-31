import { sendReaction } from '../../lib/helpers/reactionCommand.js';

export default {
  name: 'lick',
  description: 'Anime reaction GIF. Usage: .lick [@user or reply]',
  async execute(sock, msg) { return sendReaction(sock, msg, 'lick'); }
};
