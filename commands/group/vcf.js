import { getTargetJid } from '../../lib/groupHelper.js';

export default {
  name: 'vcf',
  description: "Send a user's contact card (vCard). Reply to their message or mention them. Usage: .vcf @user",
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const target = getTargetJid(msg, args);
    if (!target) return sock.sendMessage(chatId, { text: '❌ Reply to or mention the user to get their vCard.' }, { quoted: msg });
    const number = target.split('@')[0];
    const displayName = `+${number}`;
    const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${displayName}\nORG:Paxton MD;\nTEL;type=CELL;type=VOICE;waid=${number}:+${number}\nEND:VCARD`;
    await sock.sendMessage(chatId, { contacts: { displayName, contacts: [{ vcard }] } }, { quoted: msg });
  }
};
