import { uploadToCatbox } from '../../lib/api/upload.js';
import { findMedia, downloadMedia } from '../../lib/helpers/media.js';
import { react, reply, replyError } from '../../lib/helpers/reply.js';
import { config } from '../../config/index.js';

export default {
  name: 'catbox',
  description: 'Upload a replied image/video/audio and get a catbox.moe link. Usage: reply to media with .catbox',
  requires: ['WOLVAREX_API_KEY'],
  async execute(sock, msg) {
    const found = findMedia(msg, ['imageMessage', 'videoMessage', 'audioMessage']);
    if (!found) return reply(sock, msg, '❌ Reply to an image, video or audio file with .catbox');
    try {
      await react(sock, msg, '📤');
      const buffer = await downloadMedia(found, { maxBytes: config.limits.maxUploadMb * 1024 * 1024 });
      const link = await uploadToCatbox(buffer, found.mimetype);
      await reply(sock, msg, `📤 *Uploaded*\n${link}`);
      await react(sock, msg, '✅');
    } catch (err) { await replyError(sock, msg, err, 'catbox'); }
  }
};
