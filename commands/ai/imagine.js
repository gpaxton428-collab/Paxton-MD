import { generateImage, generateImageDalle } from '../../lib/api/ai.js';
import { react, reply, replyError, usage } from '../../lib/helpers/reply.js';
import { downloadBuffer } from '../../lib/utils/http.js';
import { logger } from '../../lib/utils/logger.js';

export default {
  name: 'imagine',
  alias: ['dalle'],
  description: 'Generate an image from a text prompt (DALL-E route, Flux as fallback). Usage: .imagine <prompt>',
  requires: ['WOLVAREX_API_KEY'],
  async execute(sock, msg, args, prefix) {
    const chatId = msg.key.remoteJid;
    const prompt = args.join(' ');
    if (!prompt) return reply(sock, msg, usage(prefix, 'imagine <prompt>', 'imagine a cat astronaut'));
    try {
      await react(sock, msg, '🎨');
      let out;
      try { out = await generateImageDalle(prompt); }
      catch (err) {
        if (err.kind === 'invalid_input' || err.kind === 'config') throw err;
        logger.warn('imagine', `DALL-E route failed (${err.kind || 'error'}), trying Flux`);
        out = await generateImage({ prompt, model: 'flux' });
      }
      const image = out.buffer || (await downloadBuffer(out.url, { maxBytes: 20 * 1024 * 1024 })).buffer;
      await sock.sendMessage(chatId, { image, caption: `🎨 ${prompt}` }, { quoted: msg });
      await react(sock, msg, '✅');
    } catch (err) {
      await replyError(sock, msg, err, 'imagine');
    }
  }
};
