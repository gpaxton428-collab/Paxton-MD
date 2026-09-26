// Reply to a voice note/audio clip with .shazam to identify the song.
import { recognizeAudio } from '../../lib/api/shazam.js';
import { react, reply, replyError } from '../../lib/helpers/reply.js';

export default {
  name: 'shazam',
  alias: ['identify', 'whatsong'],
  description: 'Reply to a voice note or audio clip to identify the song. Usage: reply to audio with .shazam',
  requires: ['WOLVAREX_API_KEY'],
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const audioMsg = msg.message?.audioMessage || quoted?.audioMessage;
    if (!audioMsg) return reply(sock, msg, '❌ Reply to a voice note or audio clip with .shazam');
    try {
      await react(sock, msg, '🎧');
      const { downloadContentFromMessage } = await import('@whiskeysockets/baileys');
      const stream = await downloadContentFromMessage(audioMsg, 'audio');
      const chunks = [];
      for await (const chunk of stream) chunks.push(chunk);
      const buffer = Buffer.concat(chunks);
      const song = await recognizeAudio(buffer);
      const lines = [`🎧 *${song.title}*`];
      if (song.artist) lines.push(`👤 Artist: ${song.artist}`);
      if (song.album) lines.push(`💿 Album: ${song.album}`);
      if (song.releaseDate) lines.push(`📅 Released: ${song.releaseDate}`);
      if (song.genre) lines.push(`🎼 Genre: ${song.genre}`);
      if (song.cover) { await sock.sendMessage(chatId, { image: { url: song.cover }, caption: lines.join('\n') }, { quoted: msg }); await react(sock, msg, '✅'); return; }
      await reply(sock, msg, lines.join('\n'));
      await react(sock, msg, '✅');
    } catch (err) {
      await replyError(sock, msg, err, 'shazam');
    }
  }
};
