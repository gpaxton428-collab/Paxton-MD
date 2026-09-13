import { extractViewOnceMedia, downloadViewOnceMedia } from '../../lib/viewOnce.js';

export default {
  name: 'vv2',
  ownerOnly: true,
  description: 'Like .vv, but sends the recovered view-once photo/video privately to your own DM instead of this chat (owner only).',
  async execute(sock, msg, args, prefix, ctx) {
    const chatId = msg.key.remoteJid;
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const vo = extractViewOnceMedia(quoted);
    if (!vo) return sock.sendMessage(chatId, { text: '❌ Reply to a view-once photo or video.' }, { quoted: msg });
    try {
      const buffer = await downloadViewOnceMedia(vo);
      const ownerDm = ctx.OWNER_JID;
      const caption = vo.media.caption || '(view-once, sent to your DM)';
      if (vo.type === 'image') await sock.sendMessage(ownerDm, { image: buffer, caption });
      else await sock.sendMessage(ownerDm, { video: buffer, caption });
      if (chatId !== ownerDm) await sock.sendMessage(chatId, { text: '✅ Sent to your DM.' }, { quoted: msg });
    } catch (error) {
      await sock.sendMessage(chatId, { text: `❌ Failed to recover media: ${error.message}` }, { quoted: msg });
    }
  }
};
