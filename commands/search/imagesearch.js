import { lookup } from '../../lib/api/lookup.js';
import { extractList, firstString } from '../../lib/api/normalize.js';
import { assertPublicHttpUrl } from '../../lib/utils/urlSafety.js';
import { reply, replyError, usage } from '../../lib/helpers/reply.js';

export default {
  name: 'imagesearch',
  alias: ['imgsearch'],
  description: 'Search and send images for a query. Usage: .imagesearch <query>',
  requires: ['WOLVAREX_API_KEY'],
  async execute(sock, msg, args, prefix) {
    const chatId = msg.key.remoteJid;
    if (!args.length) return reply(sock, msg, usage(prefix, 'imagesearch <query>', 'imagesearch golden retriever puppies'));
    try {
      const raw = await lookup('images', args.join(' '));
      const items = extractList(raw);
      const urls = items.map((i) => (typeof i === 'string' ? i : firstString(i, ['url', 'image', 'thumbnail']))).filter(Boolean).slice(0, 4);
      if (!urls.length) return reply(sock, msg, '🔎 No images found.');
      let sent = 0;
      for (const url of urls) {
        try { const safe = await assertPublicHttpUrl(url); await sock.sendMessage(chatId, { image: { url: safe } }, { quoted: msg }); sent++; }
        catch { /* skip a single bad/unsafe result, keep going */ }
      }
      if (!sent) await reply(sock, msg, '❌ Those image results were not safe to load.');
    } catch (err) {
      await replyError(sock, msg, err, 'imagesearch');
    }
  }
};
