import { giftedJson } from '../../lib/giftedApi.js';

export default {
  name: 'predictions',
  description: 'Get football match predictions. Usage: .predictions',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    try {
      const data = await giftedJson('/football/predictions');
      const result = data?.result;
      const text = typeof result === 'string' ? result : JSON.stringify(result, null, 2).slice(0, 2000);
      await sock.sendMessage(chatId, { text: `⚽ *predictions*\n\n${text}` }, { quoted: msg });
    } catch (error) {
      await sock.sendMessage(chatId, { text: `❌ Failed: ${error.message}` }, { quoted: msg });
    }
  }
};
