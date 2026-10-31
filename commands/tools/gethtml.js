import { downloadBuffer } from '../../lib/utils/http.js';
import { react, reply, replyError, usage } from '../../lib/helpers/reply.js';

export default {
  name: 'gethtml',
  alias: ['viewsource', 'sourcecode'],
  description: 'Get the HTML source of a public web page as a file. Usage: .gethtml <url>',
  async execute(sock, msg, args, prefix) {
    let url = (args[0] || '').trim();
    if (!url) return reply(sock, msg, usage(prefix, 'gethtml <url>', 'gethtml example.com'));
    if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
    try {
      await react(sock, msg, '🧾');
      const { buffer, finalUrl } = await downloadBuffer(url, { maxBytes: 3 * 1024 * 1024, timeoutMs: 20000, rejectTypes: null });
      const host = new URL(finalUrl).hostname.replace(/[^a-z0-9.-]/gi, '_');
      await sock.sendMessage(msg.key.remoteJid, { document: buffer, mimetype: 'text/html', fileName: `${host}.html`, caption: `🧾 Source of ${finalUrl.slice(0, 150)}` }, { quoted: msg });
    } catch (err) { await replyError(sock, msg, err, 'gethtml'); }
  }
};
