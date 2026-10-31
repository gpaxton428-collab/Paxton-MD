import { sendReaction } from '../../lib/helpers/reactionCommand.js';

export default {
  name: 'yeet',
  description: 'Anime reaction GIF. Usage: .yeet [@user or reply]',
  async execute(sock, msg) { return sendReaction(sock, msg, 'yeet'); }
};
