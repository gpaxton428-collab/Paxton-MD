import { sendReaction } from '../../lib/helpers/reactionCommand.js';

export default {
  name: 'glomp',
  description: 'Anime reaction GIF. Usage: .glomp [@user or reply]',
  async execute(sock, msg) { return sendReaction(sock, msg, 'glomp'); }
};
