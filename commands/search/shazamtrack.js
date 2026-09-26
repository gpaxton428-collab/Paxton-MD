import { getShazamTrack } from '../../lib/api/shazam.js';
import { reply, replyError, usage } from '../../lib/helpers/reply.js';

export default {
  name: 'shazamtrack',
  description: 'Look up a Shazam track by its ID. Usage: .shazamtrack <track id>',
  requires: ['WOLVAREX_API_KEY'],
  async execute(sock, msg, args, prefix) {
    if (!args[0]) return reply(sock, msg, usage(prefix, 'shazamtrack <track id>', 'shazamtrack 1217912247'));
    try {
      const song = await getShazamTrack(args[0]);
      const lines = [`🎧 *${song.title}*`];
      if (song.artist) lines.push(`👤 Artist: ${song.artist}`);
      if (song.album) lines.push(`💿 Album: ${song.album}`);
      if (song.releaseDate) lines.push(`📅 Released: ${song.releaseDate}`);
      await reply(sock, msg, lines.join('\n'));
    } catch (err) {
      await replyError(sock, msg, err, 'shazamtrack');
    }
  }
};
