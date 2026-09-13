export default {
  name: 'define',
  alias: ['dictionary'],
  description: 'Look up the definition of an English word. Usage: .define serendipity',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const word = args[0];
    if (!word) return sock.sendMessage(chatId, { text: '❌ Usage: .define <word>' }, { quoted: msg });
    try {
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
      if (!res.ok) return sock.sendMessage(chatId, { text: `❌ No definition found for "${word}".` }, { quoted: msg });
      const data = await res.json();
      const entry = data[0];
      const meaning = entry.meanings[0];
      const def = meaning.definitions[0];
      let text = `📖 *${entry.word}* (${meaning.partOfSpeech})\n\n${def.definition}`;
      if (def.example) text += `\n\n_Example: ${def.example}_`;
      await sock.sendMessage(chatId, { text }, { quoted: msg });
    } catch (error) {
      await sock.sendMessage(chatId, { text: `❌ Lookup failed: ${error.message}` }, { quoted: msg });
    }
  }
};
