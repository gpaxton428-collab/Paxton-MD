import { getGlobalSettings, setGlobalSetting, getGroupSettings, setGroupSetting } from '../../lib/settingsStore.js';
import { isSenderAdmin, replyText } from '../../lib/groupHelper.js';

export default {
  name: 'chatbot',
  alias: ['autochat'],
  description: 'Turn the AI auto-reply chatbot on or off. In a DM: toggles the whole feature (owner only). In a group: toggles full auto-reply for that group — replies to every message, not just mentions (group admin or owner). Usage: .chatbot on|off',
  async execute(sock, msg, args, currentPrefix, ctx) {
    const chatId = msg.key.remoteJid;
    const isGroup = chatId.endsWith('@g.us');
    const choice = (args[0] || '').toLowerCase();

    if (!isGroup) {
      // DM scope: master on/off switch for the whole bot.
      if (!ctx.isOwnerOrSudo()) return replyText(sock, msg, '❌ Owner only.');
      if (choice !== 'on' && choice !== 'off') {
        const settings = getGlobalSettings();
        return replyText(sock, msg, `ℹ️ Chatbot auto-reply is currently *${settings.chatbotEnabled ? 'ON' : 'OFF'}* (master switch).\nUsage: .chatbot on|off\n\nRun this inside a group instead to enable full auto-reply just for that group.`);
      }
      setGlobalSetting('chatbotEnabled', choice === 'on');
      return replyText(sock, msg, `✅ Chatbot auto-reply (master switch) turned *${choice.toUpperCase()}*.\n${choice === 'on' ? 'DMs will now get automatic AI replies. Groups still only reply when mentioned, unless a group also has .chatbot on.' : ''}`);
    }

    // Group scope: full auto-reply mode for this specific group.
    const sender = msg.key.participant || msg.key.remoteJid;
    if (!(await isSenderAdmin(sock, chatId, sender)) && !ctx.isOwnerOrSudo()) return replyText(sock, msg, '❌ Only group admins can use this command.');
    if (choice !== 'on' && choice !== 'off') {
      const settings = getGroupSettings(chatId);
      return replyText(sock, msg, `ℹ️ Full chatbot auto-reply for this group is currently *${settings.chatbotFullReply ? 'ON' : 'OFF'}*.\nWhen off, the bot still replies here if mentioned or replied to.\nUsage: .chatbot on|off`);
    }
    if (!getGlobalSettings().chatbotEnabled) {
      return replyText(sock, msg, "⚠️ Heads up: the chatbot's master switch is currently OFF (set by the owner in DM), so turning this on here won't do anything until that's on too.");
    }
    setGroupSetting(chatId, 'chatbotFullReply', choice === 'on');
    await replyText(sock, msg, `✅ Full chatbot auto-reply for this group turned *${choice.toUpperCase()}*.${choice === 'on' ? ' The bot will now reply to every message here, not just mentions.' : ''}`);
  }
};
