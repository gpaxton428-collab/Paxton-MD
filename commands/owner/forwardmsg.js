import { getTargetJid } from '../../lib/groupHelper.js';

export default {
  name: 'forwardmsg',
  alias: ['fwd'],
  ownerOnly: true,
  description: 'Forward a replied-to message to another chat. Usage: reply + .forwardmsg 27691234567',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!quoted) return sock.sendMessage(chatId, { text: '❌ Reply to the message you want to forward.' }, { quoted: msg });
    const target = getTargetJid(msg, args);
    if (!target) return sock.sendMessage(chatId, { text: '❌ Usage: reply to a message + .forwardmsg <number>' }, { quoted: msg });
    try {
      await sock.sendMessage(target, { forward: { key: msg.message.extendedTextMessage.contextInfo.stanzaId ? { remoteJid: chatId, id: msg.message.extendedTextMessage.contextInfo.stanzaId, participant: msg.message.extendedTextMessage.contextInfo.participant } : msg.key, message: quoted } });
      await sock.sendMessage(chatId, { text: '✅ Forwarded.' }, { quoted: msg });
    } catch (error) {
      await sock.sendMessage(chatId, { text: `❌ Failed to forward: ${error.message}` }, { quoted: msg });
    }
  }
};
