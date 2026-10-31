import { fetchWithTimeout } from '../../lib/utils/http.js';
import { react, replyError, reply } from '../../lib/helpers/reply.js';

export default {
  name: 'couplepp',
  alias: ['ppcouple'],
  description: 'Matching couple profile pictures. Usage: .couplepp',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    try {
      await react(sock, msg, '❤️');
      const res = await fetchWithTimeout('https://couple-pfp-api.vercel.app/api/v1/couplepfp', {}, 15000);
      const d = await res.json();
      if (!d?.male || !d?.female) return reply(sock, msg, '❌ No pictures available right now.');
      await sock.sendMessage(chatId, { image: { url: d.male }, caption: '_For him..._' }, { quoted: msg });
      await sock.sendMessage(chatId, { image: { url: d.female }, caption: '_For her..._' }, { quoted: msg });
    } catch (err) { await replyError(sock, msg, err, 'couplepp'); }
  }
};
