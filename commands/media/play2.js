// Alternative to .play — resolves the format list via getInfo() first and
// picks one manually, instead of letting the streaming call pick
// internally. Some videos that fail on .play succeed here, and vice
// versa, since YouTube's format quirks don't hit both code paths the
// same way.
const MAX_DURATION_SECONDS = 15 * 60;

export default {
  name: 'play2',
  description: 'Alternative to .play using a different download method — try this if .play fails. Usage: .play2 <song or query>',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const query = args.join(' ');
    if (!query) return sock.sendMessage(chatId, { text: '❌ Usage: .play2 <song name or query>' }, { quoted: msg });

    try {
      const { default: ytSearch } = await import('yt-search');
      const { videos } = await ytSearch(query);
      const video = videos?.[0];
      if (!video) return sock.sendMessage(chatId, { text: '❌ No results found.' }, { quoted: msg });
      if (video.seconds > MAX_DURATION_SECONDS) {
        return sock.sendMessage(chatId, { text: `❌ "${video.title}" is too long (${video.timestamp}). Max is ${MAX_DURATION_SECONDS / 60} minutes.` }, { quoted: msg });
      }

      await sock.sendMessage(chatId, { text: `🎵 [method 2] Downloading: *${video.title}* (${video.timestamp})...` }, { quoted: msg });

      const ytdl = (await import('@distube/ytdl-core')).default;
      const info = await ytdl.getInfo(video.url);
      const audioFormats = info.formats.filter((f) => f.hasAudio && !f.hasVideo);
      const format = audioFormats.sort((a, b) => (b.audioBitrate || 0) - (a.audioBitrate || 0))[0]
        || info.formats.filter((f) => f.hasAudio).sort((a, b) => (a.bitrate || 0) - (b.bitrate || 0))[0];
      if (!format) throw new Error('No audio-capable format found for this video.');

      const stream = ytdl.downloadFromInfo(info, { format });
      const chunks = [];
      for await (const chunk of stream) chunks.push(chunk);
      const buffer = Buffer.concat(chunks);

      await sock.sendMessage(chatId, {
        audio: buffer,
        mimetype: 'audio/mpeg',
        fileName: `${video.title}.mp3`,
        caption: `🎵 ${video.title}\n${video.url}`
      }, { quoted: msg });
    } catch (error) {
      await sock.sendMessage(chatId, { text: `❌ Download failed (method 2): ${error.message}` }, { quoted: msg });
    }
  }
};
