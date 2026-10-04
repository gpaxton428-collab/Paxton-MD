import { setProfilePicture } from '../../lib/helpers/imageProcessor.js';
import { findMedia, downloadMedia } from '../../lib/helpers/media.js';
import { react, reply, replyError } from '../../lib/helpers/reply.js';

export default {
  name: 'setbotpp',
  alias: ['setppbot', 'setpp', 'setbotpic'],
  ownerOnly: true,
  description: "Set the bot's WhatsApp profile picture (owner). Reply to an image with .setbotpp",
  async execute(sock, msg) {
    const found = findMedia(msg, ['imageMessage', 'stickerMessage']);
    if (!found) return reply(sock, msg, '❌ Reply to an image (or send one with the caption .setbotpp).');
    try {
      await react(sock, msg, '🖼️');
      const buffer = await downloadMedia(found, { maxBytes: 15 * 1024 * 1024 });
      const jid = sock.user?.id;
      if (!jid) throw new Error('Bot is not connected');
      await setProfilePicture(sock, jid, buffer);
      await react(sock, msg, '✅');
      await reply(sock, msg, '✅ *Bot profile picture updated.*');
    } catch (err) { await replyError(sock, msg, err, 'setbotpp'); }
  }
};
