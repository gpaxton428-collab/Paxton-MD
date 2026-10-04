import { getTargetJid, getGroupMetadata } from '../../lib/groupHelper.js';
import { getAfk } from '../../lib/helpers/afk.js';
import { reply } from '../../lib/helpers/reply.js';

export default {
  name: 'userinfo',
  alias: ['whois', 'uinfo'],
  description: 'Show info about yourself or another user. Usage: .userinfo [@user]',
  async execute(sock, msg, args, prefix, ctx) {
    const chatId = msg.key.remoteJid;
    const sender = msg.key.participant || chatId;
    const target = getTargetJid(msg, args) || sender;
    const number = target.split('@')[0].split(':')[0];
    let about = null, isAdmin = false, hasPic = false;
    try { about = (await sock.fetchStatus(target))?.status || null; } catch { /* privacy */ }
    try { await sock.profilePictureUrl(target, 'image'); hasPic = true; } catch { /* none/private */ }
    if (chatId.endsWith('@g.us')) {
      const meta = await getGroupMetadata(sock, chatId);
      const p = meta?.participants?.find((x) => [x.id, x.jid, x.lid, x.phoneNumber].filter(Boolean).some((id) => id.split('@')[0].split(':')[0] === number));
      isAdmin = p?.admin === 'admin' || p?.admin === 'superadmin';
    }
    const afk = getAfk(target);
    const lines = [
      '👤 *User Info*', '',
      `📱 Number: +${number}`,
      `🏷️ Tag: @${number}`,
      `📝 About: ${about || 'not visible'}`,
      `🖼️ Profile photo: ${hasPic ? 'yes' : 'none / hidden'}`,
      chatId.endsWith('@g.us') ? `🛡️ Group admin: ${isAdmin ? 'yes' : 'no'}` : null,
      `💤 AFK: ${afk ? `yes — ${afk.reason}` : 'no'}`,
      ctx.isOwner && target === sender ? `👑 Bot owner: ${ctx.isOwner() ? 'yes' : 'no'}` : null
    ].filter((l) => l !== null);
    await sock.sendMessage(chatId, { text: lines.join('\n'), mentions: [target] }, { quoted: msg });
  }
};
