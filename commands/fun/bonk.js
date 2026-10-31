import { sendReaction } from '../../lib/helpers/reactionCommand.js';

export default {
  name: 'bonk',
  description: 'Anime reaction GIF. Usage: .bonk [@user or reply]',
  async execute(sock, msg) { return sendReaction(sock, msg, 'bonk'); }
};
