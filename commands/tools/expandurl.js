import { assertPublicHttpUrl } from '../../lib/utils/urlSafety.js';
import { fetchWithTimeout } from '../../lib/utils/http.js';
import { reply, replyError, usage } from '../../lib/helpers/reply.js';

export default {
  name: 'expandurl',
  alias: ['unshorten'],
  description: 'Follow a shortened URL and show where it really goes. Usage: .expandurl https://bit.ly/xyz',
  async execute(sock, msg, args, prefix) {
    if (!args[0]) return reply(sock, msg, usage(prefix, 'expandurl <https://...>', 'expandurl https://bit.ly/xyz'));
    try {
      let current = await assertPublicHttpUrl(args[0]);
      const chain = [current];
      let status = 0;
      // Redirects are followed manually so EVERY hop is re-checked (SSRF guard).
      for (let hop = 0; hop < 6; hop++) {
        const res = await fetchWithTimeout(current, { method: 'HEAD', redirect: 'manual' }, 10000);
        status = res.status;
        const loc = res.headers.get('location');
        if (status >= 300 && status < 400 && loc) {
          current = await assertPublicHttpUrl(new URL(loc, current).toString());
          chain.push(current);
          continue;
        }
        break;
      }
      await reply(sock, msg, `🔗 *Final destination*\n${current}\n\nHops: ${chain.length - 1} · Status: ${status}`);
    } catch (err) { await replyError(sock, msg, err, 'expandurl'); }
  }
};
