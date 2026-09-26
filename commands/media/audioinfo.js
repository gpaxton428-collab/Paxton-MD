import { safeErrorMessage } from '../../lib/utils/errors.js';
export default {
  name: 'audioinfo',
  description: "Read ID3/metadata (title, artist, duration, etc) from a replied audio file — local, via music-metadata, no external API. Usage: reply to audio with .audioinfo",
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const audioMsg = msg.message?.audioMessage || quoted?.audioMessage;
    if (!audioMsg) return sock.sendMessage(chatId, { text: '❌ Reply to an audio file with .audioinfo' }, { quoted: msg });
    try {
      const { downloadContentFromMessage } = await import('@whiskeysockets/baileys');
      const stream = await downloadContentFromMessage(audioMsg, 'audio');
      const chunks = []; for await (const c of stream) chunks.push(c);
      const buffer = Buffer.concat(chunks);
      const mm = await import('music-metadata');
      const meta = await mm.parseBuffer(buffer, audioMsg.mimetype);
      const c = meta.common, f = meta.format;
      const text = `🎵 *Audio Info*\n\n` +
        `📝 Title: ${c.title || 'Unknown'}\n` +
        `👤 Artist: ${c.artist || 'Unknown'}\n` +
        `💿 Album: ${c.album || 'Unknown'}\n` +
        `⏱️ Duration: ${f.duration ? `${Math.round(f.duration)}s` : 'Unknown'}\n` +
        `🎚️ Bitrate: ${f.bitrate ? `${Math.round(f.bitrate / 1000)}kbps` : 'Unknown'}\n` +
        `📼 Codec: ${f.codec || f.container || 'Unknown'}`;
      await sock.sendMessage(chatId, { text }, { quoted: msg });
    } catch (error) {
      await sock.sendMessage(chatId, { text: `❌ Failed: ${safeErrorMessage(error)}` }, { quoted: msg });
    }
  }
};
