import { getGroupMetadata, replyText } from '../../lib/groupHelper.js';
import { getGroupSettings } from '../../lib/settingsStore.js';

export default {
  name: 'inactivelist',
  description: 'List non-admin members with no tracked activity in 30+ days (based on messages seen since the bot started tracking). Usage: .inactivelist',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    if (!chatId.endsWith('@g.us')) return replyText(sock, msg, '❌ This command only works in groups.');
    const metadata = await getGroupMetadata(sock, chatId);
    if (!metadata) return replyText(sock, msg, '❌ Could not load group info.');
    const settings = getGroupSettings(chatId);
    const THRESHOLD_MS = 30 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    const nonAdmins = metadata.participants.filter((p) => p.admin !== 'admin' && p.admin !== 'superadmin');
    const inactive = nonAdmins.filter((p) => settings.lastActive?.[p.id] && (now - settings.lastActive[p.id]) > THRESHOLD_MS);
    const untracked = nonAdmins.filter((p) => !settings.lastActive?.[p.id]);
    const preview = inactive.slice(0, 30).map((p) => `@${p.id.split('@')[0]}`).join(', ') || 'None';
    let text = `👥 *Inactive (30+ days, tracked)*: ${inactive.length}\n${preview}`;
    if (untracked.length) text += `\n\nℹ️ ${untracked.length} member(s) have no activity data yet (not in this list — that just means they haven't posted since tracking started).`;
    await sock.sendMessage(chatId, { text, mentions: inactive.slice(0, 30).map((p) => p.id) }, { quoted: msg });
  }
};
