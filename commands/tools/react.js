import { reply, usage } from '../../lib/helpers/reply.js';

export default {
  name: 'react',
  description: 'React to a message with an emoji. Usage: reply to a message with .react 🔥',
  async execute(sock, msg, args, prefix) {
    const info = msg.message?.extendedTextMessage?.contextInfo;
    const emoji = (args[0] || '').trim();
    if (!info?.stanzaId || !emoji) return reply(sock, msg, usage(prefix, 'react <emoji>  (reply to a message)', 'react 🔥'));
    if ([...emoji].length > 4) return reply(sock, msg, '❌ Use a single emoji.');
    const chatId = msg.key.remoteJid;
    await sock.sendMessage(chatId, { react: { text: emoji, key: { remoteJid: chatId, id: info.stanzaId, participant: info.participant, fromMe: false } } });
  }
};
