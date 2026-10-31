import { fetchWithTimeout } from '../../lib/utils/http.js';
import { react, reply, replyError } from '../../lib/helpers/reply.js';

export default {
  name: 'numberfact',
  alias: ['numfact'],
  description: 'A fun fact about a number. Usage: .numberfact [number] [trivia|math|year]',
  async execute(sock, msg, args, prefix) {
    const n = args[0] && /^-?\d{1,12}$/.test(args[0]) ? args[0] : 'random';
    const kind = ['trivia', 'math', 'year'].includes((args[1] || args[0] || '').toLowerCase()) ? (args[1] || args[0]).toLowerCase() : 'trivia';
    try {
      await react(sock, msg, '🔢');
      const res = await fetchWithTimeout(`http://numbersapi.com/${n}/${kind}`, {}, 15000);
      if (!res.ok) return reply(sock, msg, '❌ Could not fetch a fact right now.');
      await reply(sock, msg, `🔢 *Number fact*\n\n${(await res.text()).trim()}`);
    } catch (err) { await replyError(sock, msg, err, 'numberfact'); }
  }
};
