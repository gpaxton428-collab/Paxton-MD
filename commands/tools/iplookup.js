export default {
  name: 'iplookup',
  alias: ['getip'],
  description: 'Look up basic geo/ISP info for an IP address. Usage: .iplookup <ip>',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const ip = args[0];
    if (!ip) return sock.sendMessage(chatId, { text: '❌ Usage: .iplookup <ip address>' }, { quoted: msg });
    try {
      const res = await fetch(`http://ip-api.com/json/${encodeURIComponent(ip)}`);
      const data = await res.json();
      if (data.status !== 'success') return sock.sendMessage(chatId, { text: `❌ Lookup failed: ${data.message || 'invalid IP'}` }, { quoted: msg });
      const text = `🌐 *${data.query}*\n\nCountry: ${data.country}\nRegion: ${data.regionName}\nCity: ${data.city}\nISP: ${data.isp}\nTimezone: ${data.timezone}`;
      await sock.sendMessage(chatId, { text }, { quoted: msg });
    } catch (error) {
      await sock.sendMessage(chatId, { text: `❌ Lookup failed: ${error.message}` }, { quoted: msg });
    }
  }
};
