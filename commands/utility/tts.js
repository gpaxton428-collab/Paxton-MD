export default {
  name: 'tts',
  description: 'Convert text to a spoken voice note using Google Translate\'s TTS endpoint. Usage: .tts <text>',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const text = args.join(' ');
    if (!text) return sock.sendMessage(chatId, { text: '❌ Usage: .tts <text>' }, { quoted: msg });
    if (text.length > 200) return sock.sendMessage(chatId, { text: '❌ Keep it under 200 characters for TTS.' }, { quoted: msg });
    try {
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=en&q=${encodeURIComponent(text)}`;
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (!res.ok) throw new Error(`TTS service returned ${res.status}`);
      const buffer = Buffer.from(await res.arrayBuffer());
      await sock.sendMessage(chatId, { audio: buffer, mimetype: 'audio/mpeg', ptt: true }, { quoted: msg });
    } catch (error) {
      await sock.sendMessage(chatId, { text: `❌ TTS failed: ${error.message}` }, { quoted: msg });
    }
  }
};
