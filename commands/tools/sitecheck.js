import { assertPublicHttpUrl } from '../../lib/utils/urlSafety.js';
import { fetchWithTimeout } from '../../lib/utils/http.js';
import { reply, replyError, usage } from '../../lib/helpers/reply.js';

export default {
  name: 'sitecheck',
  alias: ['isup'],
  description: 'Check whether a public website is up. Usage: .sitecheck example.com',
  async execute(sock, msg, args, prefix) {
    let target = args[0];
    if (!target) return reply(sock, msg, usage(prefix, 'sitecheck <domain or URL>', 'sitecheck example.com'));
    if (!/^https?:\/\//i.test(target)) target = `https://${target}`;
    try {
      const safe = await assertPublicHttpUrl(target);
      const start = Date.now();
      let res;
      try { res = await fetchWithTimeout(safe, { method: 'HEAD', redirect: 'manual' }, 10000); }
      catch (err) { if (err.kind === 'timeout') throw err; return reply(sock, msg, `❌ ${safe} appears to be down or unreachable.`); }
      await reply(sock, msg, `✅ ${safe} is up — HTTP ${res.status} (${Date.now() - start}ms)`);
    } catch (err) {
      if (err.kind === 'timeout') return reply(sock, msg, `⏱️ ${target.slice(0, 100)} did not respond within 10 seconds.`);
      await replyError(sock, msg, err, 'sitecheck');
    }
  }
};
