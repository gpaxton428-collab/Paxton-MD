import { addSudo } from '../../lib/sudo.js';

export default {
  name: 'addsudo',
  description: 'Grant a number access to owner-only commands (true owner only — sudo users cannot grant sudo themselves). Usage: .addsudo <number>, or reply to their message.',
  async execute(sock, msg, args, prefix, ctx) {
    const chatId = msg.key.remoteJid;
    // Deliberately checks true ownership directly, not through the generic
    // ownerOnly gate — that gate now also lets sudo users through, and a
    // sudo user granting themselves or others more sudo access would be a
    // privilege-escalation hole.
    if (!ctx.isOwner()) return sock.sendMessage(chatId, { text: '❌ Only the real owner can manage sudo.' }, { quoted: msg });

    const quotedParticipant = msg.message?.extendedTextMessage?.contextInfo?.participant;
    const number = args[0]?.replace(/[^0-9]/g, '') || quotedParticipant?.split('@')[0];
    if (!number) return sock.sendMessage(chatId, { text: '❌ Usage: .addsudo <number>, or reply to their message.' }, { quoted: msg });

    const added = addSudo(number);
    await sock.sendMessage(chatId, { text: `✅ +${added} can now use owner-only commands.` }, { quoted: msg });
  }
};
