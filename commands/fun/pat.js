import { sendReaction } from '../../lib/helpers/reactionCommand.js';

export default {
  name: 'pat',
  description: 'Anime reaction GIF. Usage: .pat [@user or reply]',
  async execute(sock, msg) { return sendReaction(sock, msg, 'pat'); }
};
