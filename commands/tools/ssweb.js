import { takeScreenshot } from '../../lib/api/tools.js';
import { downloadBuffer } from '../../lib/utils/http.js';
import { react, reply, replyError, usage } from '../../lib/helpers/reply.js';

export default {
  name: 'ssweb',
  alias: ['screenshot', 'ss'],
  description: 'Screenshot a public website. Usage: .ssweb <url> [full]',
  requires: ['WOLVAREX_API_KEY'],
  async execute(sock, msg, args, prefix) {
    const chatId = msg.key.remoteJid;
    if (!args[0]) return reply(sock, msg, usage(prefix, 'ssweb <url> [full]', 'ssweb https://example.com'));
    let url = args[0];
    if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
    try {
      await react(sock, msg, '📸');
      const out = await takeScreenshot(url, { fullPage: /^full/i.test(args[1] || '') });
      const image = out.buffer || (await downloadBuffer(out.url, { maxBytes: 15 * 1024 * 1024 })).buffer;
      await sock.sendMessage(chatId, { image, caption: `📸 ${url.slice(0, 200)}` }, { quoted: msg });
      await react(sock, msg, '✅');
    } catch (err) { await replyError(sock, msg, err, 'ssweb'); }
  }
};
