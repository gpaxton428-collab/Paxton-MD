import { safeErrorMessage } from '../../lib/utils/errors.js';
export default {
  name: 'statusreact',
  ownerOnly: true,
  description: "React to a status update with any emoji — reply to the status with .statusreact 🔥 (owner only, since the bot must have seen the status to react to it).",
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const quoted = msg.message?.extendedTextMessage?.contextInfo;
    const emoji = args[0];
    if (!emoji || !quoted?.stanzaId || !quoted?.participant) {
      return sock.sendMessage(chatId, { text: '❌ Reply to a status update with .statusreact <emoji>' }, { quoted: msg });
    }
    try {
      await sock.sendMessage('status@broadcast', {
        react: { text: emoji, key: { remoteJid: 'status@broadcast', id: quoted.stanzaId, participant: quoted.participant, fromMe: false } }
      }, { statusJidList: [quoted.participant] });
      await sock.sendMessage(chatId, { text: `✅ Reacted with ${emoji}` }, { quoted: msg });
    } catch (error) {
      await sock.sendMessage(chatId, { text: `❌ Failed: ${safeErrorMessage(error)}` }, { quoted: msg });
    }
  }
};
