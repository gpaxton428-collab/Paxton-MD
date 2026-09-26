import { getTargetJid } from '../../lib/groupHelper.js';
import { reply } from '../../lib/helpers/reply.js';

export default {
  name: 'avatar',
  alias: ['pp', 'dp'],
  description: "Get someone's profile picture (yours by default). Usage: .avatar [@user]",
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const target = getTargetJid(msg, args) || msg.key.participant || chatId;
    try {
      const url = await sock.profilePictureUrl(target, 'image');
      await sock.sendMessage(chatId, { image: { url }, caption: `🖼️ Avatar of @${target.split('@')[0].split(':')[0]}`, mentions: [target] }, { quoted: msg });
    } catch {
      await reply(sock, msg, '❌ No profile picture available (they may not have one, or their privacy settings hide it).');
    }
  }
};
