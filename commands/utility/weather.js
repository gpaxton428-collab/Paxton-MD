export default {
  name: 'weather',
  description: 'Get the current weather for a city. Usage: .weather Cape Town',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const city = args.join(' ');
    if (!city) return sock.sendMessage(chatId, { text: '❌ Usage: .weather <city>' }, { quoted: msg });
    try {
      const res = await fetch(`https://wttr.in/${encodeURIComponent(city)}?format=%l:+%C+%t+(feels+%f)+💧%h+🌬️%w`);
      const text = await res.text();
      await sock.sendMessage(chatId, { text: `⛅ ${text.trim()}` }, { quoted: msg });
    } catch (error) {
      await sock.sendMessage(chatId, { text: `❌ Weather lookup failed: ${error.message}` }, { quoted: msg });
    }
  }
};
