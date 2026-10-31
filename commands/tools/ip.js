import { fetchWithTimeout } from '../../lib/utils/http.js';
import { react, reply, replyError, usage } from '../../lib/helpers/reply.js';

export default {
  name: 'ip',
  alias: ['iplookup', 'ipinfo'],
  description: 'Look up where an IP address is located. Usage: .ip <ip address>',
  async execute(sock, msg, args, prefix) {
    const ip = (args[0] || '').trim();
    if (!/^[0-9a-fA-F:.]{3,45}$/.test(ip)) return reply(sock, msg, usage(prefix, 'ip <ip address>', 'ip 8.8.8.8'));
    try {
      await react(sock, msg, '🌐');
      const res = await fetchWithTimeout(`http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,message,country,regionName,city,zip,lat,lon,timezone,isp,org,as,query`, {}, 15000);
      const d = await res.json();
      if (d.status !== 'success') return reply(sock, msg, `❌ ${d.message || 'Lookup failed'}`);
      await reply(sock, msg, `🌐 *IP Lookup*\n\n🔎 IP: ${d.query}\n🌍 Country: ${d.country}\n🏙️ Region: ${d.regionName}, ${d.city}\n📮 ZIP: ${d.zip || '—'}\n📍 Coordinates: ${d.lat}, ${d.lon}\n🕐 Timezone: ${d.timezone}\n📡 ISP: ${d.isp}\n🏢 Org: ${d.org || '—'}\n🔢 AS: ${d.as || '—'}`);
      await react(sock, msg, '✅');
    } catch (err) { await replyError(sock, msg, err, 'ip'); }
  }
};
