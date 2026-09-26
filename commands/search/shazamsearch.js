import { searchShazam } from '../../lib/api/shazam.js';
import { reply, replyError, usage } from '../../lib/helpers/reply.js';

export default {
  name: 'shazamsearch',
  alias: ['shazamlookup'],
  description: 'Search Shazam by song/artist name. Usage: .shazamsearch <song or artist>',
  requires: ['WOLVAREX_API_KEY'],
  async execute(sock, msg, args, prefix) {
    if (!args.length) return reply(sock, msg, usage(prefix, 'shazamsearch <song or artist>', 'shazamsearch Home NF'));
    try {
      const songs = await searchShazam(args.join(' '));
      const lines = songs.map((s, i) => `${i + 1}. *${s.title}*${s.artist ? ` — ${s.artist}` : ''}`);
      await reply(sock, msg, `🎧 *Shazam results*\n\n${lines.join('\n')}`);
    } catch (err) {
      await replyError(sock, msg, err, 'shazamsearch');
    }
  }
};
