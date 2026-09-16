import { giftedJson } from '../../lib/giftedApi.js';

export default {
  name: 'wikimedia',
  description: 'Look up a topic on Wikipedia. Usage: .wikimedia <title>',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const query = args.join(' ');
    if (!query) return sock.sendMessage(chatId, { text: '❌ Usage: .wikimedia <title>' }, { quoted: msg });
    try {
      const data = await giftedJson('/search/wikimedia', { title: query });
      const result = data?.result;
      const text = typeof result === 'string' ? result : JSON.stringify(result, null, 2).slice(0, 1500);
      await sock.sendMessage(chatId, { text: `🔎 *wikimedia*\n\n${text}` }, { quoted: msg });
    } catch (error) {
      await sock.sendMessage(chatId, { text: `❌ Search failed: ${error.message}` }, { quoted: msg });
    }
  }
};
