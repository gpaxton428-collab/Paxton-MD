import { reply, usage } from '../../lib/helpers/reply.js';

export default {
  name: 'edit',
  alias: ['editmsg'],
  ownerOnly: true,
  description: "Edit one of the bot's own messages. Usage: reply to a bot message with .edit <new text>",
  async execute(sock, msg, args, prefix) {
    const info = msg.message?.extendedTextMessage?.contextInfo;
    const text = args.join(' ').trim();
    if (!info?.stanzaId || !text) return reply(sock, msg, usage(prefix, 'edit <new text>  (reply to a bot message)', 'edit Updated!'));
    const chatId = msg.key.remoteJid;
    const botNum = (sock.user?.id || '').split(':')[0].split('@')[0];
    if ((info.participant || '').split('@')[0].split(':')[0] !== botNum) return reply(sock, msg, '❌ I can only edit my own messages.');
    await sock.sendMessage(chatId, { text, edit: { remoteJid: chatId, id: info.stanzaId, fromMe: true } });
  }
};
