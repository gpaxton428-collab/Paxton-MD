import { sendReaction } from '../../lib/helpers/reactionCommand.js';

export default {
  name: 'poke',
  description: 'Anime reaction GIF. Usage: .poke [@user or reply]',
  async execute(sock, msg) { return sendReaction(sock, msg, 'poke'); }
};
