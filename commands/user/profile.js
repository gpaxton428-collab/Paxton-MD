import { getTargetJid } from '../../lib/groupHelper.js';
import { getAfk } from '../../lib/helpers/afk.js';

export default {
  name: 'profile',
  alias: ['me', 'card'],
  description: 'Show a profile card (photo + about) for you or someone else. Usage: .profile [@user]',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const sender = msg.key.participant || chatId;
    const target = getTargetJid(msg, args) || sender;
    const number = target.split('@')[0].split(':')[0];
    let about = 'not visible', url = null;
    try { about = (await sock.fetchStatus(target))?.status || about; } catch { /* privacy */ }
    try { url = await sock.profilePictureUrl(target, 'image'); } catch { /* none */ }
    const afk = getAfk(target);
    const caption = `╭─〔 👤 PROFILE 〕\n│ 🏷️ @${number}\n│ 📱 +${number}\n│ 📝 ${about}\n│ 💤 ${afk ? `AFK — ${afk.reason}` : 'Available'}\n╰──────────`;
    const base = { caption, mentions: [target] };
    if (url) await sock.sendMessage(chatId, { image: { url }, ...base }, { quoted: msg });
    else await sock.sendMessage(chatId, { text: caption, mentions: [target] }, { quoted: msg });
  }
};
