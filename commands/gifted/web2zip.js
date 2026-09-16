import { giftedJson } from '../../lib/giftedApi.js';

export default {
  name: 'web2zip',
  description: 'Download a website as a zip archive. Usage: .web2zip <url>',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const url = args[0];
    if (!url) return sock.sendMessage(chatId, { text: '❌ Usage: .web2zip <url>' }, { quoted: msg });
    try {
      const data = await giftedJson('/tools/web2zip', { url });
      const zipUrl = data?.result?.url || data?.result;
      if (!zipUrl || typeof zipUrl !== 'string') return sock.sendMessage(chatId, { text: '❌ Could not generate a zip for that site.' }, { quoted: msg });
      await sock.sendMessage(chatId, { document: { url: zipUrl }, mimetype: 'application/zip', fileName: 'website.zip' }, { quoted: msg });
    } catch (error) {
      await sock.sendMessage(chatId, { text: `❌ Failed: ${error.message}` }, { quoted: msg });
    }
  }
};
