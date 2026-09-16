import { getGroupMetadata, isSenderAdmin, isBotAdmin, replyText } from '../../lib/groupHelper.js';

export default {
  name: 'kickall',
  description: "⚠️ DANGEROUS: removes every non-admin member from the group (admin only). Requires typing the confirm word so it can't fire by accident. Usage: .kickall confirm",
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    if (!chatId.endsWith('@g.us')) return replyText(sock, msg, '❌ This command only works in groups.');
    const sender = msg.key.participant || msg.key.remoteJid;
    if (!(await isSenderAdmin(sock, chatId, sender))) return replyText(sock, msg, '❌ Only group admins can use this command.');
    if (!(await isBotAdmin(sock, chatId))) return replyText(sock, msg, '❌ I need to be an admin to do that.');
    if ((args[0] || '').toLowerCase() !== 'confirm') {
      return replyText(sock, msg, '⚠️ This removes EVERY non-admin member from the group. This cannot be undone.\nType `.kickall confirm` if you\'re sure.');
    }

    const metadata = await getGroupMetadata(sock, chatId);
    if (!metadata) return replyText(sock, msg, '❌ Could not load group info.');

    const botJid = sock.user?.id?.split(':')[0] + '@s.whatsapp.net';
    const targets = metadata.participants
      .filter((p) => p.admin !== 'admin' && p.admin !== 'superadmin')
      .map((p) => p.id)
      .filter((id) => id.split('@')[0] !== botJid.split('@')[0]);

    if (!targets.length) return replyText(sock, msg, 'ℹ️ No non-admin members to remove.');

    await replyText(sock, msg, `🚨 Removing ${targets.length} member(s)... this may take a moment.`);
    let removed = 0;
    // Remove in small batches with a short pause between them — WhatsApp
    // rate-limits/flags accounts that fire off a huge participant-update
    // burst all at once, which risks the bot's own number getting banned.
    const BATCH_SIZE = 5;
    for (let i = 0; i < targets.length; i += BATCH_SIZE) {
      const batch = targets.slice(i, i + BATCH_SIZE);
      try {
        await sock.groupParticipantsUpdate(chatId, batch, 'remove');
        removed += batch.length;
      } catch {}
      if (i + BATCH_SIZE < targets.length) await new Promise((r) => setTimeout(r, 2000));
    }
    await replyText(sock, msg, `✅ Removed ${removed}/${targets.length} member(s).`);
  }
};
