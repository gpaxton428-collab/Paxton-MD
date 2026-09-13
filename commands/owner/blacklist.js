import { getTargetJid } from '../../lib/groupHelper.js';
import { getGlobalSettings, setGlobalSetting } from '../../lib/settingsStore.js';

export default {
  name: 'blacklist',
  ownerOnly: true,
  description: 'Blacklist a user — they get auto-removed from every group the bot is in, on sight (owner only). Usage: reply to/mention them with .blacklist',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const target = getTargetJid(msg, args);
    if (!target) return sock.sendMessage(chatId, { text: '❌ Reply to or mention the user to blacklist.' }, { quoted: msg });
    const settings = getGlobalSettings();
    const list = settings.globalBlacklist || [];
    if (!list.includes(target)) list.push(target);
    setGlobalSetting('globalBlacklist', list);

    let kicked = 0;
    try {
      const allChats = await sock.groupFetchAllParticipating();
      for (const gid of Object.keys(allChats)) {
        const isMember = allChats[gid].participants.some((p) => p.id === target);
        if (isMember) {
          try { await sock.groupParticipantsUpdate(gid, [target], 'remove'); kicked++; } catch {}
        }
      }
    } catch {}

    await sock.sendMessage(chatId, { text: `✅ Blacklisted @${target.split('@')[0]}. Removed from ${kicked} group(s) they were in — will be auto-kicked from any group going forward.`, mentions: [target] }, { quoted: msg });
  }
};
