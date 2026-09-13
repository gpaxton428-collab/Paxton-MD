import { getTargetJid } from '../../lib/groupHelper.js';

export default {
  name: 'fullpp',
  alias: ['getgpp'],
  description: "Get a user's (or this group's) full-resolution profile picture. Usage: .fullpp @user, or just .fullpp in a group for the group pic",
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const target = getTargetJid(msg, args) || chatId;
    try {
      const url = await sock.profilePictureUrl(target, 'image');
      await sock.sendMessage(chatId, { image: { url }, caption: '🖼️ Full profile picture' }, { quoted: msg });
    } catch {
      await sock.sendMessage(chatId, { text: '❌ Could not fetch a profile picture (they may not have one, or privacy settings block it).' }, { quoted: msg });
    }
  }
};
