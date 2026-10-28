// Free Instagram downloader — no API key. Uses rahad-all-downloader-v2,
// a zero-setup scraper covering Instagram Reels/posts/IGTV with no
// login. Same trade-off as lib/api/youtubeFree.js: free and key-less,
// but a frontend-scraping method, so it can need an update if
// Instagram changes something.
import { downloadBuffer } from '../../lib/utils/http.js';
import { react, reply, replyError, usage } from '../../lib/helpers/reply.js';
import { brandCaption } from '../../lib/caption.js';
import { AppError } from '../../lib/utils/errors.js';
import { config } from '../../config/index.js';

export default {
  name: 'instadl',
  alias: ['igdl', 'instagram'],
  description: 'Download an Instagram reel/post (public only). Usage: .instadl <instagram url>',
  async execute(sock, msg, args, prefix) {
    const chatId = msg.key.remoteJid;
    const url = args[0];
    if (!url) return reply(sock, msg, usage(prefix, 'instadl <instagram url>', 'instadl https://www.instagram.com/reel/xxxx/'));
    if (!/^https?:\/\/(www\.)?instagram\.com\//i.test(url)) return reply(sock, msg, '❌ That does not look like an Instagram link.');
    try {
      await react(sock, msg, '⬇️');
      const { alldl } = await import('rahad-all-downloader-v2');
      const result = await alldl(url);
      const items = Array.isArray(result) ? result : (result?.url ? [result] : result?.medias || result?.data || []);
      if (!items.length) throw new AppError('No downloadable media was found', { kind: 'no_results' });
      let sent = 0;
      for (const item of items) {
        const mediaUrl = item.url || item.video || item.image || item.download_url;
        if (!mediaUrl) continue;
        const isImage = /image|photo|\.jpe?g($|\?)|\.png($|\?)/i.test(item.type || mediaUrl);
        try {
          const { buffer } = await downloadBuffer(mediaUrl, { maxBytes: config.limits.maxMediaMb * 1024 * 1024, timeoutMs: 30000 });
          await sock.sendMessage(chatId, isImage ? { image: buffer, caption: brandCaption('📸 Instagram') } : { video: buffer, caption: brandCaption('📸 Instagram') }, { quoted: msg });
          sent++;
        } catch { /* skip an item that fails; report only if none sent */ }
      }
      if (!sent) return reply(sock, msg, '❌ *Download failed*\n\nThe media could not be fetched. It may be private or the link may be unsupported.');
      await react(sock, msg, '✅');
    } catch (err) {
      if (err.kind === 'no_results') return reply(sock, msg, '❌ No downloadable media was found at that link (it may be private).');
      await replyError(sock, msg, err, 'instadl');
    }
  }
};
