export default {
  name: 'translate',
  alias: ['tr'],
  description: 'Translate text. Usage: .translate es Hello, how are you?',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const lang = args[0];
    const text = args.slice(1).join(' ');
    if (!lang || !text) return sock.sendMessage(chatId, { text: '❌ Usage: .translate <target-lang-code> <text>\nExample: .translate fr Good morning' }, { quoted: msg });
    try {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${encodeURIComponent(lang)}`;
      const res = await fetch(url);
      const data = await res.json();
      const translated = data?.responseData?.translatedText;
      if (!translated) return sock.sendMessage(chatId, { text: '❌ Translation failed.' }, { quoted: msg });
      await sock.sendMessage(chatId, { text: `🌐 *${lang.toUpperCase()}:* ${translated}` }, { quoted: msg });
    } catch (error) {
      await sock.sendMessage(chatId, { text: `❌ Translation failed: ${error.message}` }, { quoted: msg });
    }
  }
};
