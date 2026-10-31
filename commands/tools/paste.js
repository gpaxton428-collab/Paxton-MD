import { fetchWithTimeout } from '../../lib/utils/http.js';
import { react, reply, replyError, usage } from '../../lib/helpers/reply.js';

export default {
  name: 'paste',
  alias: ['pastebin', 'hastebin'],
  description: 'Upload text or code to dpaste and get a link. Usage: .paste <text> (or reply to a message)',
  async execute(sock, msg, args, prefix) {
    const q = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const quoted = q?.conversation || q?.extendedTextMessage?.text || '';
    const content = (args.join(' ') || quoted).trim();
    if (!content) return reply(sock, msg, usage(prefix, 'paste <text>', 'paste console.log("hi")'));
    if (content.length > 100000) return reply(sock, msg, '❌ That is too long to paste.');
    try {
      await react(sock, msg, '📋');
      const res = await fetchWithTimeout('https://dpaste.org/api/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'PaxtonMD' }, body: new URLSearchParams({ content, expiry_days: '7' }).toString() }, 20000);
      const url = (await res.text()).trim().replace(/^"|"$/g, '');
      if (!res.ok || !/^https?:\/\//.test(url)) return reply(sock, msg, '❌ The paste service refused that. Try again later.');
      await reply(sock, msg, `📋 *Pasted*\n🔗 ${url}\n⏳ Expires in 7 days`);
    } catch (err) { await replyError(sock, msg, err, 'paste'); }
  }
};
