import { fetchWithTimeout } from '../../lib/utils/http.js';
import { react, reply, replyError, usage } from '../../lib/helpers/reply.js';

export default {
  name: 'country',
  alias: ['countryinfo'],
  description: 'Facts about a country. Usage: .country <name>',
  async execute(sock, msg, args, prefix) {
    const name = args.join(' ').trim();
    if (!name) return reply(sock, msg, usage(prefix, 'country <name>', 'country Kenya'));
    try {
      await react(sock, msg, '🌍');
      const res = await fetchWithTimeout(`https://restcountries.com/v3.1/name/${encodeURIComponent(name)}?fields=name,capital,region,subregion,population,area,currencies,languages,flags,idd,cca2`, {}, 15000);
      if (res.status === 404) return reply(sock, msg, `❌ No country found for "${name.slice(0, 40)}".`);
      const list = await res.json();
      const c = list?.[0];
      if (!c) return reply(sock, msg, '❌ No result.');
      const cur = Object.values(c.currencies || {}).map((x) => `${x.name} (${x.symbol || ''})`).join(', ') || '—';
      const lang = Object.values(c.languages || {}).join(', ') || '—';
      const dial = c.idd?.root ? `${c.idd.root}${(c.idd.suffixes || [])[0] || ''}` : '—';
      const text = `🌍 *${c.name.common}* ${c.cca2 ? `(${c.cca2})` : ''}\n\n🏛️ Official: ${c.name.official}\n📍 Capital: ${(c.capital || ['—']).join(', ')}\n🗺️ Region: ${c.region}${c.subregion ? ` · ${c.subregion}` : ''}\n👥 Population: ${Number(c.population).toLocaleString('en-US')}\n📐 Area: ${Number(c.area).toLocaleString('en-US')} km²\n💰 Currency: ${cur}\n🗣️ Languages: ${lang}\n📞 Dial code: ${dial}`;
      await sock.sendMessage(msg.key.remoteJid, c.flags?.png ? { image: { url: c.flags.png }, caption: text } : { text }, { quoted: msg });
    } catch (err) { await replyError(sock, msg, err, 'country'); }
  }
};
