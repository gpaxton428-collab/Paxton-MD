import { fetchWithTimeout } from '../../lib/utils/http.js';
import { react, reply, replyError } from '../../lib/helpers/reply.js';

const ALIASES = { btc: 'bitcoin', eth: 'ethereum', bnb: 'binancecoin', sol: 'solana', xrp: 'ripple', doge: 'dogecoin', ada: 'cardano', ton: 'the-open-network', trx: 'tron', ltc: 'litecoin', usdt: 'tether', matic: 'matic-network', dot: 'polkadot' };
const DEFAULT = ['bitcoin', 'ethereum', 'binancecoin', 'solana', 'ripple', 'dogecoin'];

export default {
  name: 'crypto',
  alias: ['coin', 'bitcoin', 'btc'],
  description: 'Live crypto prices in USD. Usage: .crypto [btc eth sol ...]',
  async execute(sock, msg, args) {
    const ids = [...new Set((args.length ? args : DEFAULT).slice(0, 8).map((a) => { const k = a.toLowerCase().replace(/[^a-z0-9-]/g, ''); return ALIASES[k] || k; }).filter(Boolean))];
    try {
      await react(sock, msg, '💹');
      const res = await fetchWithTimeout(`https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(ids.join(','))}&vs_currencies=usd&include_24hr_change=true`, {}, 15000);
      if (!res.ok) return reply(sock, msg, `❌ Price service returned ${res.status}. Try again in a minute.`);
      const data = await res.json();
      const rows = ids.filter((id) => data[id]).map((id) => {
        const { usd, usd_24h_change: ch } = data[id];
        const arrow = ch >= 0 ? '🟢▲' : '🔴▼';
        return `• *${id}*: $${Number(usd).toLocaleString('en-US', { maximumFractionDigits: usd < 1 ? 6 : 2 })}  ${arrow} ${Math.abs(ch ?? 0).toFixed(2)}%`;
      });
      if (!rows.length) return reply(sock, msg, '❌ Coin not found. Use the full name, e.g. .crypto bitcoin cardano');
      await reply(sock, msg, `💹 *Crypto prices (USD)*\n\n${rows.join('\n')}\n\n_24h change shown_`);
    } catch (err) { await replyError(sock, msg, err, 'crypto'); }
  }
};
