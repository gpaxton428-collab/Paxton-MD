import { sendReaction } from '../../lib/helpers/reactionCommand.js';

export default {
  name: 'happy',
  description: 'Anime reaction GIF. Usage: .happy [@user or reply]',
  async execute(sock, msg) { return sendReaction(sock, msg, 'happy'); }
};
