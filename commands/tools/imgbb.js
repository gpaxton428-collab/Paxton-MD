import { uploadToImgbb } from '../../lib/api/upload.js';
import { findMedia, downloadMedia } from '../../lib/helpers/media.js';
import { react, reply, replyError } from '../../lib/helpers/reply.js';
import { config } from '../../config/index.js';

export default {
  name: 'imgbb',
  description: 'Upload a replied image and get an imgbb.com link. Usage: reply to an image with .imgbb',
  requires: ['WOLVAREX_API_KEY'],
  async execute(sock, msg) {
    const found = findMedia(msg, ['imageMessage']);
    if (!found) return reply(sock, msg, '❌ Reply to an image with .imgbb');
    try {
      await react(sock, msg, '📤');
      const buffer = await downloadMedia(found, { maxBytes: config.limits.maxUploadMb * 1024 * 1024 });
      const link = await uploadToImgbb(buffer, found.mimetype);
      await reply(sock, msg, `📤 *Uploaded*\n${link}`);
      await react(sock, msg, '✅');
    } catch (err) { await replyError(sock, msg, err, 'imgbb'); }
  }
};
