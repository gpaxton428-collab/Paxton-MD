// .play <song>  ->  /music/ytmp3-search  ->  /music/ytmp3-download  ->  audio
// Shows a metadata card (title, artist, release date, views, duration) and
// updates ONE message through Searching -> Downloading -> Done, using
// WhatsApp's { edit } feature, then sends the audio.
import { searchTracks, getTrackDownload, maxAudioSeconds } from '../../lib/api/music.js';
import { downloadBuffer, looksLikeAudio } from '../../lib/utils/http.js';
import { AppError } from '../../lib/utils/errors.js';
import { cleanFileName } from '../../lib/utils/format.js';
import { logger } from '../../lib/utils/logger.js';
import { react, reply, replyError, usage } from '../../lib/helpers/reply.js';
import { pickResult as pickSaved } from '../../lib/helpers/musicSession.js';
import { config } from '../../config/index.js';

const inFlight = new Set();

function card(track, status) {
  const lines = [`🎵 *${track.title}*`];
  if (track.artist) lines.push(`👤 Artist: ${track.artist}`);
  if (track.releaseDate) lines.push(`📅 Released: ${track.releaseDate}`);
  if (track.views) lines.push(`👁️ Views: ${track.views}`);
  if (track.duration) lines.push(`⏱️ Duration: ${track.duration}`);
  lines.push('', status);
  return lines.join('\n');
}

export default {
  name: 'play',
  alias: ['song', 'music'],
  description: 'Search a song and send it as audio, with title/artist/release date/views. Usage: .play <song name>  (or .play 2 after .songs)',
  requires: ['WOLVAREX_API_KEY'],
  async execute(sock, msg, args, prefix) {
    const chatId = msg.key.remoteJid;
    const sender = msg.key.participant || chatId;
    const input = args.join(' ').trim();
    if (!input) return reply(sock, msg, usage(prefix, 'play <song name>', 'play NF - The Search'));

    const lock = `${chatId}|${sender}`;
    if (inFlight.has(lock)) return reply(sock, msg, '⏳ You already have a song downloading — please wait for it to finish.');
    inFlight.add(lock);
    let statusMsg = null;
    // Edits `statusMsg` if it exists, otherwise sends a new message.
    const setStatus = async (text) => {
      if (statusMsg) { try { return await sock.sendMessage(chatId, { text, edit: statusMsg.key }); } catch { /* fall through to a fresh message */ } }
      statusMsg = await sock.sendMessage(chatId, { text }, { quoted: msg });
      return statusMsg;
    };

    try {
      await react(sock, msg, '🔍');

      // 1) choose the track: either "n" from the last .songs list, or the top search hit
      let track = /^\d{1}$/.test(input) ? pickSaved(chatId, sender, Number(input)) : null;
      if (!track) track = (await searchTracks(input, { limit: 1 }))[0];

      if (track.durationSeconds && track.durationSeconds > maxAudioSeconds()) {
        await react(sock, msg, '❌');
        return reply(sock, msg, `❌ *Too long*\n\n"${track.title}" is ${track.duration}. The limit is ${config.limits.maxAudioMinutes} minutes.`);
      }

      // 2) metadata card (thumbnail is best-effort and SSRF-checked); this is the message we edit as progress moves along
      if (track.thumbnail) {
        try {
          const { buffer } = await downloadBuffer(track.thumbnail, { maxBytes: 3 * 1024 * 1024, timeoutMs: 10000 });
          statusMsg = await sock.sendMessage(chatId, { image: buffer, caption: card(track, '⬇️ Downloading…') }, { quoted: msg });
        } catch (err) { logger.debug('play', `thumbnail skipped (${err.kind || 'error'})`); }
      }
      if (!statusMsg) await setStatus(card(track, '⬇️ Downloading…'));

      // 3) resolve + download the audio
      const dl = await getTrackDownload(track.id);
      const { buffer, contentType } = await downloadBuffer(dl.url, {
        maxBytes: config.limits.maxAudioMb * 1024 * 1024,
        timeoutMs: config.wolvarex.downloadTimeoutMs
      });
      if (!/^audio\//i.test(contentType) && !looksLikeAudio(buffer)) {
        logger.warn('play', `download was not audio (content-type: ${contentType || 'none'}, ${buffer.length} bytes)`);
        throw new AppError('Downloaded file is not audio', { kind: 'bad_response' });
      }

      // 4) "done" edit, then the audio itself
      await setStatus(card(track, '✅ Done — sending the audio now.')).catch(() => {});
      const isM4a = /mp4|m4a|aac/i.test(contentType) || buffer.slice(4, 8).toString() === 'ftyp';
      const fileName = `${cleanFileName(track.title, 'audio')}.${isM4a ? 'm4a' : 'mp3'}`;
      try {
        await sock.sendMessage(chatId, { audio: buffer, mimetype: isM4a ? 'audio/mp4' : 'audio/mpeg', fileName, ptt: false }, { quoted: msg });
      } catch (sendErr) {
        logger.warn('play', `audio send failed, retrying as document: ${sendErr.message}`);
        await sock.sendMessage(chatId, { document: buffer, mimetype: isM4a ? 'audio/mp4' : 'audio/mpeg', fileName }, { quoted: msg });
      }
      await react(sock, msg, '✅');
    } catch (err) {
      if (err.kind === 'no_results') {
        await react(sock, msg, '❌');
        return reply(sock, msg, `🔎 *No results*\n\nNothing found for "${input.slice(0, 60)}". Check the spelling or try adding the artist name.`);
      }
      if (statusMsg) await setStatus('❌ Download failed — see the error below.').catch(() => {});
      await replyError(sock, msg, err, 'play');
    } finally {
      inFlight.delete(lock);
    }
  }
};
