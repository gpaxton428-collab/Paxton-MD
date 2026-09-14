import { wolvarexJson } from '../../lib/wolvarexApi.js';

export default {
  name: 'ytmp3dl',
  alias: ['ytmp3'],
  description: 'Download audio (MP3) from a YouTube video ID. Usage: .ytmp3dl <video id or url>',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    let id = args[0];
    if (!id) return sock.sendMessage(chatId, { text: '❌ Usage: .ytmp3dl <youtube video id or url>' }, { quoted: msg });
    const match = id.match(/(?:v=|youtu\.be\/|\/shorts\/)([\w-]{11})/);
    if (match) id = match[1];
    try {
      const data = await wolvarexJson('/music/ytmp3-download', { id, provider: 'ytmp3' });
      const audioUrl = data?.result?.url || data?.result?.download || data?.url;
      if (!audioUrl) return sock.sendMessage(chatId, { text: '❌ Could not get a download link for that video.' }, { quoted: msg });
      await sock.sendMessage(chatId, { audio: { url: audioUrl }, mimetype: 'audio/mpeg' }, { quoted: msg });
    } catch (error) {
      await sock.sendMessage(chatId, { text: `❌ Download failed: ${error.message}` }, { quoted: msg });
    }
  }
};
