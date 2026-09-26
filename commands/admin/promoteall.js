import { getGroupMetadata, isSenderAdmin, isBotAdmin, replyText } from '../../lib/groupHelper.js';

export default {
  name: 'promoteall',
  description: "⚠️ Promotes every non-admin member to admin (admin only). Requires typing the confirm word. Usage: .promoteall confirm",
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    if (!chatId.endsWith('@g.us')) return replyText(sock, msg, '❌ This command only works in groups.');
    const sender = msg.key.participant || msg.key.remoteJid;
    if (!(await isSenderAdmin(sock, chatId, sender))) return replyText(sock, msg, '❌ Only group admins can use this command.');
    if (!(await isBotAdmin(sock, chatId))) return replyText(sock, msg, '❌ I need to be an admin to do that.');
    if ((args[0] || '').toLowerCase() !== 'confirm') {
      return replyText(sock, msg, '⚠️ This promotes EVERY non-admin member to admin.\nType `.promoteall confirm` if you\'re sure.');
    }
    const metadata = await getGroupMetadata(sock, chatId);
    if (!metadata) return replyText(sock, msg, '❌ Could not load group info.');
    const targets = metadata.participants.filter((p) => p.admin !== 'admin' && p.admin !== 'superadmin').map((p) => p.id);
    if (!targets.length) return replyText(sock, msg, 'ℹ️ Everyone is already an admin.');
    await replyText(sock, msg, `🚨 Promoting ${targets.length} member(s)...`);
    let done = 0;
    const BATCH_SIZE = 5;
    for (let i = 0; i < targets.length; i += BATCH_SIZE) {
      const batch = targets.slice(i, i + BATCH_SIZE);
      try { await sock.groupParticipantsUpdate(chatId, batch, 'promote'); done += batch.length; } catch {}
      if (i + BATCH_SIZE < targets.length) await new Promise((r) => setTimeout(r, 2000));
    }
    await replyText(sock, msg, `✅ Promoted ${done}/${targets.length} member(s).`);
  }
};
