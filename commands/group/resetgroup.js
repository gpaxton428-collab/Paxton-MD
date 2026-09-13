import { getGroupMetadata, isSenderAdmin, isBotAdmin, replyText } from '../../lib/groupHelper.js';

export default {
  name: 'resetgroup',
  description: '⚠️ Remove every non-admin member from the group (admin only). Destructive — usage: .resetgroup confirm',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    if (!chatId.endsWith('@g.us')) return replyText(sock, msg, '❌ This command only works in groups.');
    const sender = msg.key.participant || msg.key.remoteJid;
    if (!(await isSenderAdmin(sock, chatId, sender))) return replyText(sock, msg, '❌ Only group admins can use this command.');
    if (!(await isBotAdmin(sock, chatId))) return replyText(sock, msg, '❌ I need to be an admin to do that.');
    if ((args[0] || '').toLowerCase() !== 'confirm') {
      return replyText(sock, msg, '⚠️ This removes EVERY non-admin member from the group. This cannot be undone.\nType *.resetgroup confirm* to proceed.');
    }
    const metadata = await getGroupMetadata(sock, chatId);
    if (!metadata) return replyText(sock, msg, '❌ Could not fetch group members.');
    const targets = metadata.participants.filter((p) => !p.admin).map((p) => p.id);
    if (targets.length === 0) return replyText(sock, msg, 'ℹ️ No non-admin members to remove.');
    let removed = 0;
    for (const jid of targets) {
      try {
        await sock.groupParticipantsUpdate(chatId, [jid], 'remove');
        removed++;
        await new Promise((r) => setTimeout(r, 500));
      } catch {}
    }
    await replyText(sock, msg, `✅ Removed ${removed}/${targets.length} non-admin member(s).`);
  }
};
