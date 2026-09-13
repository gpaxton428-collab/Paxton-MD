import { isSenderAdmin, replyText } from '../../lib/groupHelper.js';
import { getGroupSettings, setGroupSetting } from '../../lib/settingsStore.js';

export default {
  name: 'antidemote',
  description: 'Protects admins from being demoted by anyone but the owner (admin only). Usage: .antidemote on|off|action demote|remove',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    if (!chatId.endsWith('@g.us')) return replyText(sock, msg, '❌ This command only works in groups.');
    const sender = msg.key.participant || msg.key.remoteJid;
    if (!(await isSenderAdmin(sock, chatId, sender))) return replyText(sock, msg, '❌ Only group admins can use this command.');

    const sub = (args[0] || '').toLowerCase();

    if (sub === 'action') {
      const mode = (args[1] || '').toLowerCase();
      if (!['demote', 'remove'].includes(mode)) return replyText(sock, msg, '❌ Usage: .antidemote action demote|remove');
      setGroupSetting(chatId, 'antidemoteAction', mode);
      return replyText(sock, msg, `✅ Anti-demote action set to *${mode}*.${mode === 'remove' ? ' The demoter will be removed immediately.' : ' The demoter gets warnings before removal.'}`);
    }

    if (sub !== 'on' && sub !== 'off') {
      const settings = getGroupSettings(chatId);
      return replyText(sock, msg,
        `*🚫 Anti-Demote Settings for this Group*\n\n` +
        `📍 *JID:* \`${chatId}\`\n\n` +
        `🔹 *Status:* ${settings.antidemote ? '✅ ENABLED' : '❌ DISABLED'}\n` +
        `🔹 *Action:* ${settings.antidemoteAction === 'remove' ? '⛔ Remove demoter immediately' : '⬇️ Warn then remove demoter'}\n\n` +
        `*Commands:*\n` +
        `▸ *.antidemote on* — Enable\n` +
        `▸ *.antidemote off* — Disable\n` +
        `▸ *.antidemote action demote|remove* — Set action`
      );
    }

    setGroupSetting(chatId, 'antidemote', sub === 'on');
    await replyText(sock, msg, `✅ Anti-demote turned *${sub.toUpperCase()}*.${sub === 'on' ? ' I need to be an admin for this to work.' : ''}`);
  }
};
