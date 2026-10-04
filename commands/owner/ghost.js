import { safeErrorMessage } from '../../lib/utils/errors.js';
export default {
  name: 'ghost',
  ownerOnly: true,
  description: "Ghost Whisper — sends your message to someone via the bot; they never see it came from you. Usage: reply to their message or @mention them, .ghost <message>",
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const target = msg.message?.extendedTextMessage?.contextInfo?.participant
      || msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
    const text = args.join(' ');
    if (!target || !text) return sock.sendMessage(chatId, { text: '❌ Reply to or mention who this goes to, then: .ghost <message>' }, { quoted: msg });
    try {
      await sock.sendMessage(target, { text });
      await sock.sendMessage(chatId, { text: '👻 Delivered.' }, { quoted: msg });
    } catch (error) {
      await sock.sendMessage(chatId, { text: `❌ Failed: ${safeErrorMessage(error)}` }, { quoted: msg });
    }
  }
};
