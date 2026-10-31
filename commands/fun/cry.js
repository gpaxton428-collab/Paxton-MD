import { sendReaction } from '../../lib/helpers/reactionCommand.js';

export default {
  name: 'cry',
  description: 'Anime reaction GIF. Usage: .cry [@user or reply]',
  async execute(sock, msg) { return sendReaction(sock, msg, 'cry'); }
};
