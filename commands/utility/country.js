export default {
  name: 'country',
  description: 'Get quick facts about a country. Usage: .country <name>',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const query = args.join(' ');
    if (!query) return sock.sendMessage(chatId, { text: '❌ Usage: .country <name>' }, { quoted: msg });
    try {
      const res = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(query)}?fields=name,capital,population,region,languages,currencies,flag`);
      if (!res.ok) return sock.sendMessage(chatId, { text: `❌ No country found matching "${query}".` }, { quoted: msg });
      const [c] = await res.json();
      const langs = c.languages ? Object.values(c.languages).join(', ') : 'N/A';
      const currencies = c.currencies ? Object.values(c.currencies).map((cur) => cur.name).join(', ') : 'N/A';
      const text = `${c.flag || ''} *${c.name?.common}*\n\n` +
        `Capital: ${c.capital?.[0] || 'N/A'}\n` +
        `Region: ${c.region}\n` +
        `Population: ${c.population?.toLocaleString?.() || c.population}\n` +
        `Languages: ${langs}\n` +
        `Currency: ${currencies}`;
      await sock.sendMessage(chatId, { text }, { quoted: msg });
    } catch (error) {
      await sock.sendMessage(chatId, { text: `❌ Lookup failed: ${error.message}` }, { quoted: msg });
    }
  }
};
