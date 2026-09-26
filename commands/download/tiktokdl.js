import { brandCaption } from '../../lib/caption.js';
import { validateSocialUrl, TIKTOK_HOSTS } from '../../lib/api/social.js';
import { downloadBuffer } from '../../lib/utils/http.js';
import { AppError } from '../../lib/utils/errors.js';
import { react, reply, replyError, usage } from '../../lib/helpers/reply.js';
import { config } from '../../config/index.js';

export default {
  name: 'tiktokdl',
  alias: ['tiktok', 'tt'],
  description: 'Download a TikTok video (no watermark where available). Usage: .tiktokdl <tiktok url>',
  async execute(sock, msg, args, prefix) {
    const chatId = msg.key.remoteJid;
    if (!args[0]) return reply(sock, msg, usage(prefix, 'tiktokdl <tiktok url>', 'tiktokdl https://vm.tiktok.com/xxxx/'));
    try {
      await react(sock, msg, '⬇️');
      const url = await validateSocialUrl(args[0], TIKTOK_HOSTS);
      const TiktokDL = (await import('@tobyg74/tiktok-api-dl')).default;
      const result = await TiktokDL.Downloader(url, { version: 'v1' });
      const data = result?.result;
      const videoUrl = data?.video?.[0] || data?.video1 || data?.videoHD || data?.videoSD;
      if (!videoUrl) throw new AppError('No downloadable video', { kind: 'no_results' });
      const { buffer } = await downloadBuffer(videoUrl, { maxBytes: config.limits.maxMediaMb * 1024 * 1024, timeoutMs: config.wolvarex.downloadTimeoutMs });
      await sock.sendMessage(chatId, { video: buffer, caption: brandCaption(`🎵 ${String(data?.desc || 'TikTok download').slice(0, 200)}`) }, { quoted: msg });
      await react(sock, msg, '✅');
    } catch (err) {
      if (err.kind === 'no_results') return reply(sock, msg, '❌ No downloadable video was found at that link.');
      await replyError(sock, msg, err, 'tiktokdl');
    }
  }
};
