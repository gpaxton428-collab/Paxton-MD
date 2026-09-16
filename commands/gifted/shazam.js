import { giftedJson } from '../../lib/giftedApi.js';

export default {
  name: 'shazam',
  description: 'Identify a song from an audio file URL. Usage: .shazam <audio url>',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const url = args[0];
    if (!url) return sock.sendMessage(chatId, { text: '❌ Usage: .shazam <audio url>' }, { quoted: msg });
    try {
      const data = await giftedJson('/search/shazam', { url });
      const result = data?.result;
      const title = result?.title || result?.track;
      const artist = result?.artist || result?.subtitle;
      if (!title) return sock.sendMessage(chatId, { text: '❌ Could not identify that song.' }, { quoted: msg });
      await sock.sendMessage(chatId, { text: `🎵 *Shazam Result*\n\n🎶 ${title}${artist ? `\n👤 ${artist}` : ''}` }, { quoted: msg });
    } catch (error) {
      await sock.sendMessage(chatId, { text: `❌ Failed: ${error.message}` }, { quoted: msg });
    }
  }
};
