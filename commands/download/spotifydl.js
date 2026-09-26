// .spotifydl <spotify track link>  ->  /spotify/download -> audio
import { getSpotifyTrack, downloadSpotifyTrack } from '../../lib/api/spotify.js';
import { looksLikeAudio } from '../../lib/utils/http.js';
import { AppError } from '../../lib/utils/errors.js';
import { cleanFileName } from '../../lib/utils/format.js';
import { react, reply, replyError, usage } from '../../lib/helpers/reply.js';

export default {
  name: 'spotifydl',
  alias: ['spotify'],
  description: 'Download a song from a Spotify track link. Usage: .spotifydl <spotify track link>',
  requires: ['WOLVAREX_API_KEY'],
  async execute(sock, msg, args, prefix) {
    const chatId = msg.key.remoteJid;
    const url = args[0];
    if (!url || !/^https?:\/\/open\.spotify\.com\//i.test(url)) return reply(sock, msg, usage(prefix, 'spotifydl <spotify track link>', 'spotifydl https://open.spotify.com/track/0VjIjW4GlUZAMYd2vXMi3b'));
    try {
      await react(sock, msg, '🔍');
      let track = null;
      try { track = await getSpotifyTrack(url); } catch { /* metadata is best-effort; download can proceed without it */ }
      await reply(sock, msg, track ? `⬇️ Downloading *${track.title}*${track.artist ? ` — ${track.artist}` : ''}…` : '⬇️ Downloading…');
      const query = track ? `${track.title} ${track.artist || ''}`.trim() : undefined;
      const buffer = await downloadSpotifyTrack(url, query);
      if (!looksLikeAudio(buffer)) throw new AppError('Downloaded file is not audio', { kind: 'bad_response' });
      const fileName = `${cleanFileName(track?.title || 'spotify-track', 'audio')}.mp3`;
      await sock.sendMessage(chatId, { audio: buffer, mimetype: 'audio/mpeg', fileName, ptt: false }, { quoted: msg });
      await react(sock, msg, '✅');
    } catch (err) {
      await replyError(sock, msg, err, 'spotifydl');
    }
  }
};
