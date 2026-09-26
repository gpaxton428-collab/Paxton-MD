export default {
  name: 'listlanguages',
  description: 'List the language codes supported by .translate and .setlanguage. Usage: .listlanguages',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    const langs = 'en (English), es (Spanish), fr (French), de (German), pt (Portuguese), it (Italian), ar (Arabic), hi (Hindi), zh (Chinese), ja (Japanese), ko (Korean), ru (Russian), sw (Swahili), zu (Zulu), af (Afrikaans)';
    await sock.sendMessage(chatId, { text: `🌐 *Supported language codes:*\n${langs}` }, { quoted: msg });
  }
};
