import { sendReaction } from '../../lib/helpers/reactionCommand.js';

export default {
  name: 'kill',
  description: 'Anime reaction GIF. Usage: .kill [@user or reply]',
  async execute(sock, msg) { return sendReaction(sock, msg, 'kill'); }
};
