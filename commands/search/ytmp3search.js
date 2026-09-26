import { searchTracks } from '../../lib/api/music.js';
import { reply, replyError, usage } from '../../lib/helpers/reply.js';
import { saveResults } from '../../lib/helpers/musicSession.js';

export default {
  name: 'songs',
  alias: ['ytmp3search', 'songsearch'],
  description: 'List song results, then pick one with .play <number>. Usage: .songs <query>',
  requires: ['WOLVAREX_API_KEY'],
  async execute(sock, msg, args, prefix) {
    const chatId = msg.key.remoteJid;
    const query = args.join(' ');
    if (!query) return reply(sock, msg, usage(prefix, 'songs <query>', 'songs NF The Search'));
    try {
      const tracks = await searchTracks(query, { limit: 5 });
      saveResults(chatId, msg.key.participant || chatId, tracks);
      const list = tracks.map((t, i) => `*${i + 1}.* ${t.title}${t.artist ? `\n     👤 ${t.artist}` : ''}${t.duration ? ` · ⏱️ ${t.duration}` : ''}`).join('\n\n');
      await reply(sock, msg, `🎶 *Results for "${query.slice(0, 50)}"*\n\n${list}\n\n➡️ Send *${prefix}play <number>* (e.g. ${prefix}play 2) within 5 minutes.`);
    } catch (err) {
      if (err.kind === 'no_results') return reply(sock, msg, `🔎 *No results*\n\nNothing found for "${query.slice(0, 60)}".`);
      await replyError(sock, msg, err, 'songs');
    }
  }
};
