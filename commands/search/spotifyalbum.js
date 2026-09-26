import { getSpotifyAlbum } from '../../lib/api/spotify.js';
import { reply, replyError, usage } from '../../lib/helpers/reply.js';

export default {
  name: 'spotifyalbum',
  description: 'Look up a Spotify album (ID or link). Usage: .spotifyalbum <id or spotify link>',
  requires: ['WOLVAREX_API_KEY'],
  async execute(sock, msg, args, prefix) {
    if (!args[0]) return reply(sock, msg, usage(prefix, 'spotifyalbum <id or link>', 'spotifyalbum 4aawyAB9vmqN3uQ7FjRGTy'));
    try {
      const a = await getSpotifyAlbum(args[0]);
      const lines = [`💿 *${a.name}*`];
      if (a.artist) lines.push(`👤 Artist: ${a.artist}`);
      if (a.releaseDate) lines.push(`📅 Released: ${a.releaseDate}`);
      if (a.trackCount) lines.push(`🎵 Tracks: ${a.trackCount}`);
      if (a.tracks.length) lines.push('', ...a.tracks.map((t, i) => `${i + 1}. ${t}`));
      if (a.cover) { await sock.sendMessage(msg.key.remoteJid, { image: { url: a.cover }, caption: lines.join('\n') }, { quoted: msg }); return; }
      await reply(sock, msg, lines.join('\n'));
    } catch (err) {
      await replyError(sock, msg, err, 'spotifyalbum');
    }
  }
};
