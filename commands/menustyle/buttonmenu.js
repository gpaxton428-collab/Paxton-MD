// Quick-reply buttons where each button's id IS a real slash command —
// when WhatsApp renders and taps one, it sends that exact text back,
// which flows through the normal dispatcher like the user typed it. No
// extra plumbing needed. Whether buttons actually render depends on the
// WhatsApp client/account (see .buttontest) — if they don't show up,
// this just prints as plain text with nothing tappable, which is a
// WhatsApp client limitation, not a bug here.
import { sendButtons } from '../../lib/buttons.js';

export default {
  name: 'buttonmenu',
  description: 'Show a quick-access button menu for common commands (falls back to plain text if your WhatsApp client doesn\'t render buttons). Usage: .buttonmenu',
  async execute(sock, msg, args, currentPrefix, ctx) {
    const chatId = msg.key.remoteJid;
    try {
      await sendButtons(sock, chatId, {
        text: `⚡ *${ctx.BOT_NAME}* — quick actions`,
        footer: 'Tap a button, or use the commands directly.',
        buttons: [
          { text: '📜 Full Menu', id: `${currentPrefix}menu` },
          { text: '🏓 Ping', id: `${currentPrefix}ping` },
          { text: '⏱️ Runtime', id: `${currentPrefix}runtime` },
          { text: '📦 Repo', id: `${currentPrefix}repo` }
        ],
        quoted: msg
      });
    } catch (error) {
      await sock.sendMessage(chatId, { text: `❌ Couldn't send buttons: ${error.message}` }, { quoted: msg });
    }
  }
};
