import { generateImage } from '../../lib/api/ai.js';
import { react, reply, replyError, usage } from '../../lib/helpers/reply.js';
import { downloadBuffer } from '../../lib/utils/http.js';

export default {
  name: 'flux',
  alias: ['fluxai'],
  description: 'Generate an image with the Flux model. Usage: .flux <prompt> [ratio e.g. 16:9]',
  requires: ['WOLVAREX_API_KEY'],
  async execute(sock, msg, args, prefix) {
    const chatId = msg.key.remoteJid;
    const words = [...args];
    const ratio = words.length && /^\d{1,2}:\d{1,2}$/.test(words[words.length - 1]) ? words.pop() : '1:1';
    const prompt = words.join(' ');
    if (!prompt) return reply(sock, msg, usage(prefix, 'flux <prompt> [ratio]', 'flux a neon city at night 16:9'));
    try {
      await react(sock, msg, '🎨');
      const out = await generateImage({ prompt, ratio, model: 'flux' });
      const image = out.buffer || (await downloadBuffer(out.url, { maxBytes: 20 * 1024 * 1024 })).buffer;
      await sock.sendMessage(chatId, { image, caption: `🎨 ${prompt}` }, { quoted: msg });
      await react(sock, msg, '✅');
    } catch (err) {
      await replyError(sock, msg, err, 'flux');
    }
  }
};
