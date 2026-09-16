import { giftedJson } from '../../lib/giftedApi.js';

export default {
  name: 'jokes2',
  description: 'Get a random joke. Usage: .jokes2',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    try {
      const data = await giftedJson('/fun/jokes');
      const result = data?.result;
      const text = typeof result === 'string' ? result : (result?.text || result?.quote || result?.joke || result?.advice || result?.dare || result?.line || JSON.stringify(result));
      await sock.sendMessage(chatId, { text }, { quoted: msg });
    } catch (error) {
      await sock.sendMessage(chatId, { text: `❌ Failed: ${error.message}` }, { quoted: msg });
    }
  }
};
