import { sendButtons } from '../../lib/buttons.js';

export default {
  name: 'buttontest',
  ownerOnly: true,
  description: 'Send a test message with buttons, to check whether your WhatsApp client actually renders them (owner only) — WhatsApp deprecated buttons for most personal accounts, so this may just show as plain text.',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    try {
      await sendButtons(sock, chatId, {
        text: 'If you can see tappable buttons below this text, buttons work on your account. If you only see this text with nothing else, WhatsApp isn\'t rendering them here — that\'s a WhatsApp client limitation, not something fixable in the bot code.',
        footer: 'Paxton MD button test',
        buttons: [
          { text: '✅ I see buttons', id: 'btn_yes' },
          { text: '❌ No buttons', id: 'btn_no' }
        ],
        quoted: msg
      });
    } catch (error) {
      await sock.sendMessage(chatId, { text: `❌ Failed to send: ${error.message}\n\nThis usually means WhatsApp rejected the button format outright for this account type.` }, { quoted: msg });
    }
  }
};
