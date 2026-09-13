import { isSenderAdmin, replyText } from '../../lib/groupHelper.js';
import { getGroupSettings, setGroupSetting } from '../../lib/settingsStore.js';

export default {
  name: 'antipromote',
  description: 'Protects the group from unauthorized admin promotions (admin only). Usage: .antipromote on|off|action demote|remove',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    if (!chatId.endsWith('@g.us')) return replyText(sock, msg, '❌ This command only works in groups.');
    const sender = msg.key.participant || msg.key.remoteJid;
    if (!(await isSenderAdmin(sock, chatId, sender))) return replyText(sock, msg, '❌ Only group admins can use this command.');

    const sub = (args[0] || '').toLowerCase();

    if (sub === 'action') {
      const mode = (args[1] || '').toLowerCase();
      if (!['demote', 'remove'].includes(mode)) return replyText(sock, msg, '❌ Usage: .antipromote action demote|remove');
      setGroupSetting(chatId, 'antipromoteAction', mode);
      return replyText(sock, msg, `✅ Anti-promote action set to *${mode}*.${mode === 'remove' ? ' Both the promoter and the promoted user will be removed immediately.' : ' The promoter gets warnings before removal.'}`);
    }

    if (sub !== 'on' && sub !== 'off') {
      const settings = getGroupSettings(chatId);
      return replyText(sock, msg,
        `*🚫 Anti-Promote Settings for this Group*\n\n` +
        `📍 *JID:* \`${chatId}\`\n\n` +
        `🔹 *Status:* ${settings.antipromote ? '✅ ENABLED' : '❌ DISABLED'}\n` +
        `🔹 *Action:* ${settings.antipromoteAction === 'remove' ? '⛔ Remove both immediately' : '⬇️ Warn then remove promoter'}\n\n` +
        `*Actions:*\n` +
        `▸ *demote* — Warn the promoter, revert the promotion, eventually kick the promoter\n` +
        `▸ *remove* — Immediately remove both the promoter and the promoted user\n\n` +
        `*Commands:*\n` +
        `▸ *.antipromote on* — Enable\n` +
        `▸ *.antipromote off* — Disable\n` +
        `▸ *.antipromote action demote|remove* — Set action`
      );
    }

    setGroupSetting(chatId, 'antipromote', sub === 'on');
    await replyText(sock, msg, `✅ Anti-promote turned *${sub.toUpperCase()}*.${sub === 'on' ? ' I need to be an admin for this to work.' : ''}`);
  }
};
