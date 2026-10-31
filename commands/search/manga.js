import { sendMal } from '../../lib/api/jikan.js';

export default {
  name: 'manga',
  description: 'Look up a manga on MyAnimeList. Usage: .manga <title>',
  async execute(sock, msg, args, prefix) { return sendMal(sock, msg, args, prefix, 'manga'); }
};
