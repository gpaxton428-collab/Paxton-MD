import { fetchWithTimeout, downloadBuffer } from '../../lib/utils/http.js';
import { react, reply, replyError } from '../../lib/helpers/reply.js';
import { brandCaption } from '../../lib/caption.js';

export default {
  name: 'meme',
  alias: ['memes'],
  description: 'Send a random meme template. Usage: .meme',
  async execute(sock, msg) {
    try {
      await react(sock, msg, '😂');
      const res = await fetchWithTimeout('https://api.imgflip.com/get_memes', {}, 15000);
      const list = (await res.json())?.data?.memes || [];
      if (!list.length) return reply(sock, msg, '❌ No memes available right now.');
      const m = list[Math.floor(Math.random() * list.length)];
      const { buffer } = await downloadBuffer(m.url, { maxBytes: 10 * 1024 * 1024, timeoutMs: 20000 });
      await sock.sendMessage(msg.key.remoteJid, { image: buffer, caption: brandCaption(`😂 ${m.name}`) }, { quoted: msg });
    } catch (err) { await replyError(sock, msg, err, 'meme'); }
  }
};
