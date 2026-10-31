import { sendReaction } from '../../lib/helpers/reactionCommand.js';

export default {
  name: 'highfive',
  description: 'Anime reaction GIF. Usage: .highfive [@user or reply]',
  async execute(sock, msg) { return sendReaction(sock, msg, 'highfive'); }
};
