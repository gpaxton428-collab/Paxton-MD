import { getInstagramMedia } from '../../lib/api/social.js';
import { downloadBuffer } from '../../lib/utils/http.js';
import { react, reply, replyError, usage } from '../../lib/helpers/reply.js';
import { brandCaption } from '../../lib/caption.js';
import { config } from '../../config/index.js';

export default {
  name: 'instadl',
  alias: ['igdl', 'instagram'],
  description: 'Download an Instagram reel/post. Usage: .instadl <instagram url>',
  requires: ['WOLVAREX_API_KEY'],
  async execute(sock, msg, args, prefix) {
    const chatId = msg.key.remoteJid;
    if (!args[0]) return reply(sock, msg, usage(prefix, 'instadl <instagram url>', 'instadl https://www.instagram.com/reel/xxxx/'));
    try {
      await react(sock, msg, '⬇️');
      const media = await getInstagramMedia(args[0]);
      let sent = 0;
      for (const m of media) {
        try {
          const { buffer } = await downloadBuffer(m.url, { maxBytes: config.limits.maxMediaMb * 1024 * 1024, timeoutMs: config.wolvarex.downloadTimeoutMs });
          await sock.sendMessage(chatId, m.type === 'image' ? { image: buffer, caption: brandCaption('📸 Instagram') } : { video: buffer, caption: brandCaption('📸 Instagram') }, { quoted: msg });
          sent++;
        } catch { /* skip an item that fails; report only if none sent */ }
      }
      if (!sent) return reply(sock, msg, '❌ *Download failed*\n\nThe media could not be fetched. It may be private or too large.');
      await react(sock, msg, '✅');
    } catch (err) {
      if (err.kind === 'no_results') return reply(sock, msg, '❌ No downloadable media was found at that link (it may be private).');
      await replyError(sock, msg, err, 'instadl');
    }
  }
};
