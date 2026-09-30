import { extractViewOnceMedia, downloadViewOnceMedia } from '../../lib/viewOnce.js';

export default {
  name: 'vv',
  alias: ['viewonce'],
  ownerOnly: true,
  description: 'Resend a view-once photo/video so it can be viewed again (owner only). Reply to it.',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const vo = extractViewOnceMedia(quoted);
    if (!vo) return sock.sendMessage(chatId, { text: '❌ Reply to a view-once photo or video.' }, { quoted: msg });
    try {
      const buffer = await downloadViewOnceMedia(vo);
      const caption = vo.media.caption || '';
      if (vo.type === 'image') await sock.sendMessage(chatId, { image: buffer, caption }, { quoted: msg });
      else await sock.sendMessage(chatId, { video: buffer, caption }, { quoted: msg });
    } catch (error) {
      await sock.sendMessage(chatId, { text: `❌ Failed to recover media: ${error.message}` }, { quoted: msg });
    }
  }
};
