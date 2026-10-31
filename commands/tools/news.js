import { fetchWithTimeout } from '../../lib/utils/http.js';
import { react, reply, replyError } from '../../lib/helpers/reply.js';

const FEEDS = {
  world: 'https://feeds.bbci.co.uk/news/world/rss.xml',
  africa: 'https://feeds.bbci.co.uk/news/world/africa/rss.xml',
  tech: 'https://feeds.bbci.co.uk/news/technology/rss.xml',
  business: 'https://feeds.bbci.co.uk/news/business/rss.xml',
  sport: 'https://feeds.bbci.co.uk/sport/rss.xml'
};
const dec = (s) => s.replace(/<!\[CDATA\[|\]\]>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim();

export default {
  name: 'news',
  alias: ['headlines'],
  description: 'Top headlines. Usage: .news [world|africa|tech|business|sport]',
  async execute(sock, msg, args, prefix) {
    const topic = (args[0] || 'world').toLowerCase();
    if (!FEEDS[topic]) return reply(sock, msg, `❌ Pick one of: ${Object.keys(FEEDS).join(', ')}\nExample: ${prefix}news tech`);
    try {
      await react(sock, msg, '📰');
      const res = await fetchWithTimeout(FEEDS[topic], { headers: { 'User-Agent': 'Mozilla/5.0 PaxtonMD' } }, 15000);
      if (!res.ok) return reply(sock, msg, `❌ News feed returned ${res.status}.`);
      const xml = await res.text();
      const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0, 6).map((m) => ({
        title: dec((m[1].match(/<title>([\s\S]*?)<\/title>/) || [])[1] || ''),
        link: dec((m[1].match(/<link>([\s\S]*?)<\/link>/) || [])[1] || '')
      })).filter((i) => i.title);
      if (!items.length) return reply(sock, msg, '❌ No headlines right now.');
      await reply(sock, msg, `📰 *${topic.toUpperCase()} headlines*\n\n${items.map((i, n) => `${n + 1}. ${i.title}\n   ${i.link}`).join('\n\n')}`);
    } catch (err) { await replyError(sock, msg, err, 'news'); }
  }
};
