import { downloadBuffer } from '../../lib/utils/http.js';
import { react, reply, replyError, usage } from '../../lib/helpers/reply.js';

const cps = (e) => [...e].map((c) => c.codePointAt(0).toString(16)).filter((h) => h !== 'fe0f').join('-');

export default {
  name: 'emojimix',
  alias: ['mixemoji', 'emojiblend'],
  description: 'Blend two emojis into one image. Usage: .emojimix 😎+🔥',
  async execute(sock, msg, args, prefix) {
    const parts = args.join('').split('+').map((s) => s.trim()).filter(Boolean);
    if (parts.length !== 2) return reply(sock, msg, usage(prefix, 'emojimix <emoji>+<emoji>', 'emojimix 😎+🔥'));
    const [a, b] = parts.map(cps);
    try {
      await react(sock, msg, '🎭');
      let got;
      for (const [x, y] of [[a, b], [b, a]]) {
        for (const date of ['20201001', '20210218', '20211115', '20220110']) {
          try {
            got = await downloadBuffer(`https://www.gstatic.com/android/keyboard/emojikitchen/${date}/u${x}/u${x}_u${y}.png`, { maxBytes: 3 * 1024 * 1024, timeoutMs: 10000 });
            break;
          } catch { /* try the next combination */ }
        }
        if (got) break;
      }
      if (!got) return reply(sock, msg, '❌ Those two emojis can\'t be mixed. Try different ones.');
      await sock.sendMessage(msg.key.remoteJid, { image: got.buffer, caption: parts.join(' + ') }, { quoted: msg });
    } catch (err) { await replyError(sock, msg, err, 'emojimix'); }
  }
};
