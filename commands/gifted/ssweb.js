import { giftedJson } from '../../lib/giftedApi.js';

export default {
  name: 'ssweb',
  alias: ['screenshot'],
  description: 'Take a screenshot of a website. Usage: .ssweb <url>',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const url = args[0];
    if (!url) return sock.sendMessage(chatId, { text: '❌ Usage: .ssweb <url>' }, { quoted: msg });
    try {
      const data = await giftedJson('/tools/ssweb', { url });
      const imageUrl = data?.result?.url || data?.result;
      if (!imageUrl || typeof imageUrl !== 'string') return sock.sendMessage(chatId, { text: '❌ Screenshot failed.' }, { quoted: msg });
      await sock.sendMessage(chatId, { image: { url: imageUrl }, caption: `📸 ${url}` }, { quoted: msg });
    } catch (error) {
      await sock.sendMessage(chatId, { text: `❌ Failed: ${error.message}` }, { quoted: msg });
    }
  }
};
