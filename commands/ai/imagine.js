import { wolvarexJson } from '../../lib/wolvarexApi.js';

export default {
  name: 'imagine',
  alias: ['dalle'],
  description: 'Generate an image from a text prompt using DALL-E. Usage: .imagine <prompt>',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const prompt = args.join(' ');
    if (!prompt) return sock.sendMessage(chatId, { text: '❌ Usage: .imagine <prompt>' }, { quoted: msg });
    try {
      const data = await wolvarexJson('/ai/image/dall-e', { q: prompt, prompt });
      const imageUrl = data?.result?.url || data?.result || data?.url;
      if (!imageUrl) return sock.sendMessage(chatId, { text: '❌ No image returned for that prompt.' }, { quoted: msg });
      await sock.sendMessage(chatId, { image: { url: imageUrl }, caption: `🎨 ${prompt}` }, { quoted: msg });
    } catch (error) {
      await sock.sendMessage(chatId, { text: `❌ Generation failed: ${error.message}` }, { quoted: msg });
    }
  }
};
