import { getTrackDownload, extractVideoId } from '../../lib/api/music.js';
import { downloadBuffer, looksLikeAudio } from '../../lib/utils/http.js';
import { AppError } from '../../lib/utils/errors.js';
import { react, reply, replyError, usage } from '../../lib/helpers/reply.js';
import { config } from '../../config/index.js';

export default {
  name: 'ytmp3dl',
  alias: ['ytmp3'],
  description: 'Download audio from a YouTube link or video id. Usage: .ytmp3dl <youtube link or id>',
  requires: ['WOLVAREX_API_KEY'],
  async execute(sock, msg, args, prefix) {
    const chatId = msg.key.remoteJid;
    const id = extractVideoId(args[0]);
    if (!args[0]) return reply(sock, msg, usage(prefix, 'ytmp3dl <youtube link or id>', 'ytmp3dl https://youtu.be/dQw4w9WgXcQ'));
    if (!id) return reply(sock, msg, '❌ That is not a valid YouTube link or 11-character video id.');
    try {
      await react(sock, msg, '⬇️');
      const dl = await getTrackDownload(id);
      const { buffer, contentType } = await downloadBuffer(dl.url, { maxBytes: config.limits.maxAudioMb * 1024 * 1024, timeoutMs: config.wolvarex.downloadTimeoutMs });
      if (!/^audio\//i.test(contentType) && !looksLikeAudio(buffer)) throw new AppError('Downloaded file is not audio', { kind: 'bad_response' });
      await sock.sendMessage(chatId, { audio: buffer, mimetype: 'audio/mpeg', fileName: `${id}.mp3` }, { quoted: msg });
      await react(sock, msg, '✅');
    } catch (err) { await replyError(sock, msg, err, 'ytmp3dl'); }
  }
};
