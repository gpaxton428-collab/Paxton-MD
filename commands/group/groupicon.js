import { isSenderAdmin, isBotAdmin, replyText } from '../../lib/groupHelper.js';
import { setProfilePicture } from '../../lib/helpers/imageProcessor.js';
import { findMedia, downloadMedia } from '../../lib/helpers/media.js';
import { replyError } from '../../lib/helpers/reply.js';

export default {
  name: 'groupicon',
  alias: ['setgpp'],
  description: "Set the group's icon (admin only). Reply to an image.",
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    if (!chatId.endsWith('@g.us')) return replyText(sock, msg, '❌ This command only works in groups.');
    const sender = msg.key.participant || msg.key.remoteJid;
    if (!(await isSenderAdmin(sock, chatId, sender))) return replyText(sock, msg, '❌ Only group admins can use this command.');
    if (!(await isBotAdmin(sock, chatId))) return replyText(sock, msg, '❌ I need to be an admin to do that.');
    const found = findMedia(msg, ['imageMessage']);
    if (!found) return replyText(sock, msg, '❌ Reply to (or send with caption) an image.');
    try {
      const buffer = await downloadMedia(found, { maxBytes: 15 * 1024 * 1024 });
      await setProfilePicture(sock, chatId, buffer);
      await replyText(sock, msg, '✅ Group icon updated.');
    } catch (err) {
      await replyError(sock, msg, err, 'groupicon');
    }
  }
};
