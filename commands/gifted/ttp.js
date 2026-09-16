import { giftedJson } from '../../lib/giftedApi.js';

export default {
  name: 'ttp',
  description: 'Turn text into a sticker-style PNG image. Usage: .ttp <text>',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const query = args.join(' ');
    if (!query) return sock.sendMessage(chatId, { text: '❌ Usage: .ttp <text>' }, { quoted: msg });
    try {
      const data = await giftedJson('/tools/ttp', { query });
      const imageUrl = data?.result?.url || data?.result;
      if (!imageUrl || typeof imageUrl !== 'string') return sock.sendMessage(chatId, { text: '❌ Failed to generate image.' }, { quoted: msg });
      await sock.sendMessage(chatId, { sticker: { url: imageUrl } }, { quoted: msg });
    } catch (error) {
      await sock.sendMessage(chatId, { text: `❌ Failed: ${error.message}` }, { quoted: msg });
    }
  }
};
