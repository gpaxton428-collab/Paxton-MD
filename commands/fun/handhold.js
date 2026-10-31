import { sendReaction } from '../../lib/helpers/reactionCommand.js';

export default {
  name: 'handhold',
  description: 'Anime reaction GIF. Usage: .handhold [@user or reply]',
  async execute(sock, msg) { return sendReaction(sock, msg, 'handhold'); }
};
