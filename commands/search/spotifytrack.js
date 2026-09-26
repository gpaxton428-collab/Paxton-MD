import { getSpotifyTrack } from '../../lib/api/spotify.js';
import { reply, replyError, usage } from '../../lib/helpers/reply.js';

function fmtDuration(ms) { if (!ms) return null; const s = Math.round(ms / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; }

export default {
  name: 'spotifytrack',
  alias: ['spotifyinfo'],
  description: 'Look up a Spotify track (ID or link). Usage: .spotifytrack <id or spotify link>',
  requires: ['WOLVAREX_API_KEY'],
  async execute(sock, msg, args, prefix) {
    if (!args[0]) return reply(sock, msg, usage(prefix, 'spotifytrack <id or link>', 'spotifytrack 0VjIjW4GlUZAMYd2vXMi3b'));
    try {
      const t = await getSpotifyTrack(args[0]);
      const lines = [`🎧 *${t.title}*`];
      if (t.artist) lines.push(`👤 Artist: ${t.artist}`);
      if (t.album) lines.push(`💿 Album: ${t.album}`);
      if (t.releaseDate) lines.push(`📅 Released: ${t.releaseDate}`);
      const dur = fmtDuration(t.durationMs); if (dur) lines.push(`⏱️ Duration: ${dur}`);
      if (t.cover) { await sock.sendMessage(msg.key.remoteJid, { image: { url: t.cover }, caption: lines.join('\n') }, { quoted: msg }); return; }
      await reply(sock, msg, lines.join('\n'));
    } catch (err) {
      await replyError(sock, msg, err, 'spotifytrack');
    }
  }
};
