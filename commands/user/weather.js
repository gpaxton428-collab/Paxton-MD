import { getWeather } from '../../lib/api/tools.js';
import { reply, replyError, usage } from '../../lib/helpers/reply.js';

export default {
  name: 'weather',
  description: 'Get the current weather for a city. Usage: .weather Cape Town',
  async execute(sock, msg, args, prefix) {
    const city = args.join(' ');
    if (!city) return reply(sock, msg, usage(prefix, 'weather <city>', 'weather Cape Town'));
    try { await reply(sock, msg, await getWeather(city)); }
    catch (err) {
      if (err.kind === 'no_results') return reply(sock, msg, `🔎 Couldn't find a place called "${city.slice(0, 40)}".`);
      await replyError(sock, msg, err, 'weather');
    }
  }
};
