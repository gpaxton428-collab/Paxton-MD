import { getTargetJid } from '../../lib/groupHelper.js';

export default {
  name: 'getpp',
  ownerOnly: true,
  description: "Fetch someone's profile picture (owner only). Reply to or mention them.",
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const target = getTargetJid(msg, args) || chatId;
    try {
      const url = await sock.profilePictureUrl(target, 'image');
      await sock.sendMessage(chatId, { image: { url }, caption: `🖼️ Profile picture for @${target.split('@')[0]}`, mentions: [target] }, { quoted: msg });
    } catch {
      await sock.sendMessage(chatId, { text: '❌ Could not fetch a profile picture (they may not have one, or privacy settings block it).' }, { quoted: msg });
    }
  }
};
