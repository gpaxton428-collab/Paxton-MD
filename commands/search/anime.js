import { sendMal } from '../../lib/api/jikan.js';

export default {
  name: 'anime',
  alias: ['animesearch'],
  description: 'Look up an anime on MyAnimeList. Usage: .anime <title>',
  async execute(sock, msg, args, prefix) { return sendMal(sock, msg, args, prefix, 'anime'); }
};
