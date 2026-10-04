import { getGroupMetadata, isSenderAdmin, isBotAdmin, replyText } from '../../lib/groupHelper.js';
import { getGroupSettings } from '../../lib/settingsStore.js';

export default {
  name: 'kickinactive',
  description: "⚠️ Kicks members who show up on .inactivelist (admin only). Requires typing the confirm word. Usage: .kickinactive confirm",
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    if (!chatId.endsWith('@g.us')) return replyText(sock, msg, '❌ This command only works in groups.');
    const sender = msg.key.participant || msg.key.remoteJid;
    if (!(await isSenderAdmin(sock, chatId, sender))) return replyText(sock, msg, '❌ Only group admins can use this command.');
    if (!(await isBotAdmin(sock, chatId))) return replyText(sock, msg, '❌ I need to be an admin to do that.');
    const settings = getGroupSettings(chatId);
    const inactiveJids = Object.keys(settings.lastActive || {});
    const metadata = await getGroupMetadata(sock, chatId);
    if (!metadata) return replyText(sock, msg, '❌ Could not load group info.');
    const THRESHOLD_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
    const now = Date.now();
    // Only counts members we HAVE seen and who've gone quiet — someone
    // with no tracked activity yet (e.g. right after a fresh install)
    // is "unknown", not "inactive", and must never be swept up here.
    const targets = metadata.participants
      .filter((p) => p.admin !== 'admin' && p.admin !== 'superadmin')
      .filter((p) => settings.lastActive?.[p.id] && (now - settings.lastActive[p.id]) > THRESHOLD_MS)
      .map((p) => p.id);
    if (!targets.length) return replyText(sock, msg, 'ℹ️ No members with 30+ days of tracked inactivity found. (Members with no activity data yet are never included — that just means we haven\'t seen them post since tracking started, not that they\'re inactive.)');
    if ((args[0] || '').toLowerCase() !== 'confirm') {
      return replyText(sock, msg, `⚠️ This will remove ${targets.length} member(s) inactive for 30+ days.\nType \`.kickinactive confirm\` if you're sure.`);
    }
    await replyText(sock, msg, `🚨 Removing ${targets.length} inactive member(s)...`);
    let removed = 0;
    const BATCH_SIZE = 5;
    for (let i = 0; i < targets.length; i += BATCH_SIZE) {
      const batch = targets.slice(i, i + BATCH_SIZE);
      try { await sock.groupParticipantsUpdate(chatId, batch, 'remove'); removed += batch.length; } catch {}
      if (i + BATCH_SIZE < targets.length) await new Promise((r) => setTimeout(r, 2000));
    }
    await replyText(sock, msg, `✅ Removed ${removed}/${targets.length} inactive member(s).`);
  }
};
