import { safeErrorMessage } from '../../lib/utils/errors.js';
import { getTargetJid } from '../../lib/groupHelper.js';

export default {
  name: 'status',
  description: "Get the profile status/bio of the bot, a tagged user, or a replied user. Usage: .status [@mention] (reply also works)",
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    if (typeof sock.fetchStatus !== 'function') {
      return sock.sendMessage(chatId, { text: '❌ This Baileys version has no fetchStatus() method — update @whiskeysockets/baileys.' }, { quoted: msg });
    }
    const target = getTargetJid(msg, args) || sock.user?.id?.replace(/:\d+/, '');
    try {
      const result = await sock.fetchStatus(target);
      const statusText = result?.status || result?.[0]?.status;
      const setAt = result?.setAt || result?.[0]?.setAt;
      if (!statusText) return sock.sendMessage(chatId, { text: 'ℹ️ No status/bio set (or it\'s private).' }, { quoted: msg });
      await sock.sendMessage(chatId, {
        text: `📱 *Status*\n\n"${statusText}"${setAt ? `\n\n🕐 Set: ${new Date(setAt).toLocaleString()}` : ''}`,
        mentions: [target]
      }, { quoted: msg });
    } catch (error) {
      await sock.sendMessage(chatId, { text: `❌ Couldn't fetch status: ${safeErrorMessage(error)}` }, { quoted: msg });
    }
  }
};
