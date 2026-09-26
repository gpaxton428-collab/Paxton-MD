import { countryInfo } from '../../lib/api/lookup.js';
import { reply, replyError, usage } from '../../lib/helpers/reply.js';

export default {
  name: 'countryinfo',
  alias: ['country'],
  description: 'Look up basic facts about a country. Usage: .countryinfo <country>',
  requires: ['WOLVAREX_API_KEY'],
  async execute(sock, msg, args, prefix) {
    if (!args.length) return reply(sock, msg, usage(prefix, 'countryinfo <country>', 'countryinfo Japan'));
    try {
      const c = await countryInfo(args.join(' '));
      const lines = [`🌍 *${c.name}*`];
      if (c.capital) lines.push(`🏛️ Capital: ${c.capital}`);
      if (c.region) lines.push(`📍 Region: ${c.region}`);
      if (c.population) lines.push(`👥 Population: ${c.population}`);
      if (c.currency) lines.push(`💰 Currency: ${c.currency}`);
      if (c.flag) { await sock.sendMessage(msg.key.remoteJid, { image: { url: c.flag }, caption: lines.join('\n') }, { quoted: msg }); return; }
      await reply(sock, msg, lines.join('\n'));
    } catch (err) {
      await replyError(sock, msg, err, 'countryinfo');
    }
  }
};
