const MAX_DURATION_SECONDS = 8 * 60;

export default {
  name: 'video',
  alias: ['ytmp4', 'ytvideo'],
  description: 'Search YouTube and send back the video for the first result. Usage: .video <query>',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const query = args.join(' ');
    if (!query) return sock.sendMessage(chatId, { text: '❌ Usage: .video <query>' }, { quoted: msg });

    try {
      const { default: ytSearch } = await import('yt-search');
      const { videos } = await ytSearch(query);
      const video = videos?.[0];
      if (!video) return sock.sendMessage(chatId, { text: '❌ No results found.' }, { quoted: msg });
      if (video.seconds > MAX_DURATION_SECONDS) {
        return sock.sendMessage(chatId, { text: `❌ "${video.title}" is too long (${video.timestamp}). Max is ${MAX_DURATION_SECONDS / 60} minutes for video.` }, { quoted: msg });
      }

      await sock.sendMessage(chatId, { text: `🎬 Downloading: *${video.title}* (${video.timestamp})...` }, { quoted: msg });

      const ytdl = (await import('@distube/ytdl-core')).default;
      if (!ytdl.validateURL(video.url)) throw new Error('Could not resolve a valid video URL from search result.');

      let buffer;
      try {
        const stream = ytdl(video.url, { filter: 'videoandaudio', quality: 'lowest', highWaterMark: 1 << 25 });
        const chunks = [];
        for await (const chunk of stream) chunks.push(chunk);
        buffer = Buffer.concat(chunks);
        if (buffer.length === 0) throw new Error('empty stream');
      } catch (streamErr) {
        const info = await ytdl.getInfo(video.url);
        const format = ytdl.chooseFormat(info.formats, { filter: 'videoandaudio', quality: 'lowest' })
          || ytdl.chooseFormat(info.formats, { filter: (f) => f.hasVideo && f.hasAudio, quality: 'lowest' });
        if (!format) throw streamErr;
        const stream = ytdl.downloadFromInfo(info, { format });
        const chunks = [];
        for await (const chunk of stream) chunks.push(chunk);
        buffer = Buffer.concat(chunks);
      }

      await sock.sendMessage(chatId, {
        video: buffer,
        mimetype: 'video/mp4',
        caption: `🎬 ${video.title}\n${video.url}`
      }, { quoted: msg });
    } catch (error) {
      await sock.sendMessage(chatId, { text: `❌ Download failed: ${error.message}` }, { quoted: msg });
    }
  }
};
