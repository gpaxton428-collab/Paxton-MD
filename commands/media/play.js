const MAX_DURATION_SECONDS = 15 * 60;

// NOTE on reliability: YouTube changes its player/signature format often,
// and libraries like ytdl-core can break for days until they catch up
// upstream. If this keeps failing with "no playable formats" even after
// `npm update @distube/ytdl-core`, that's most likely why — try .play2,
// which selects a format a different way and sometimes succeeds where
// the direct stream approach fails.
export default {
  name: 'play',
  alias: ['ytmp3', 'song'],
  description: 'Search YouTube and send back the audio for the first result. Usage: .play <song or query>',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const query = args.join(' ');
    if (!query) return sock.sendMessage(chatId, { text: '❌ Usage: .play <song name or query>' }, { quoted: msg });

    try {
      const { default: ytSearch } = await import('yt-search');
      const { videos } = await ytSearch(query);
      const video = videos?.[0];
      if (!video) return sock.sendMessage(chatId, { text: '❌ No results found.' }, { quoted: msg });
      if (video.seconds > MAX_DURATION_SECONDS) {
        return sock.sendMessage(chatId, { text: `❌ "${video.title}" is too long (${video.timestamp}). Max is ${MAX_DURATION_SECONDS / 60} minutes.` }, { quoted: msg });
      }

      await sock.sendMessage(chatId, { text: `🎵 Downloading: *${video.title}* (${video.timestamp})...` }, { quoted: msg });

      const ytdl = (await import('@distube/ytdl-core')).default;
      if (!ytdl.validateURL(video.url)) throw new Error('Could not resolve a valid video URL from search result.');

      let buffer;
      try {
        const stream = ytdl(video.url, { filter: 'audioonly', quality: 'highestaudio', highWaterMark: 1 << 25 });
        const chunks = [];
        for await (const chunk of stream) chunks.push(chunk);
        buffer = Buffer.concat(chunks);
        if (buffer.length === 0) throw new Error('empty stream');
      } catch (streamErr) {
        // Fallback: resolve formats via getInfo + chooseFormat instead of
        // letting the streaming call pick internally — catches cases where
        // the direct filter approach finds nothing but a format actually exists.
        const info = await ytdl.getInfo(video.url);
        const format = ytdl.chooseFormat(info.formats, { filter: 'audioonly', quality: 'highestaudio' })
          || ytdl.chooseFormat(info.formats, { filter: (f) => f.hasAudio, quality: 'lowest' });
        if (!format) throw streamErr;
        const stream = ytdl.downloadFromInfo(info, { format });
        const chunks = [];
        for await (const chunk of stream) chunks.push(chunk);
        buffer = Buffer.concat(chunks);
      }

      await sock.sendMessage(chatId, {
        audio: buffer,
        mimetype: 'audio/mpeg',
        fileName: `${video.title}.mp3`,
        caption: `🎵 ${video.title}\n${video.url}`
      }, { quoted: msg });
    } catch (error) {
      await sock.sendMessage(chatId, { text: `❌ Download failed: ${error.message}\n\n💡 Try .play2 — it uses a different method and sometimes works when this doesn't.` }, { quoted: msg });
    }
  }
};
