// Facebook video downloader — free, no API key. Same backend and
// trade-offs as instadl.js (see its header comment).
import { downloadBuffer } from '../../lib/utils/http.js';
import { react, reply, replyError, usage } from '../../lib/helpers/reply.js';
import { brandCaption } from '../../lib/caption.js';
import { AppError } from '../../lib/utils/errors.js';
import { config } from '../../config/index.js';

export default {
  name: 'fbdl',
  alias: ['fb', 'facebook'],
  description: 'Download a public Facebook video. Usage: .fbdl <facebook video url>',
  async execute(sock, msg, args, prefix) {
    const chatId = msg.key.remoteJid;
    const url = args[0];
    if (!url) return reply(sock, msg, usage(prefix, 'fbdl <facebook video url>', 'fbdl https://www.facebook.com/watch/?v=xxxx'));
    if (!/^https?:\/\/(www\.|m\.|web\.)?(facebook\.com|fb\.watch)\//i.test(url)) return reply(sock, msg, '❌ That does not look like a Facebook link.');
    try {
      await react(sock, msg, '⬇️');
      const { alldl } = await import('rahad-all-downloader-v2');
      const result = await alldl(url);
      const mediaUrl = result?.url || result?.hd || result?.sd || result?.video || result?.download_url;
      if (!mediaUrl) throw new AppError('No downloadable video was found', { kind: 'no_results' });
      const { buffer } = await downloadBuffer(mediaUrl, { maxBytes: config.limits.maxMediaMb * 1024 * 1024, timeoutMs: 30000 });
      await sock.sendMessage(chatId, { video: buffer, caption: brandCaption('📘 Facebook') }, { quoted: msg });
      await react(sock, msg, '✅');
    } catch (err) {
      if (err.kind === 'no_results') return reply(sock, msg, '❌ No downloadable video was found at that link (it may be private).');
      await replyError(sock, msg, err, 'fbdl');
    }
  }
};
