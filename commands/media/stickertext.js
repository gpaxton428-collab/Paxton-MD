import { brandSticker } from '../../lib/stickerBrand.js';

export default {
  name: 'stickertext',
  alias: ['textsticker'],
  description: 'Make a sticker out of plain text. Usage: .stickertext Hello World',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const text = args.join(' ');
    if (!text) return sock.sendMessage(chatId, { text: '❌ Usage: .stickertext <text>' }, { quoted: msg });
    try {
      const sharp = (await import('sharp')).default;
      const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const fontSize = text.length > 40 ? 36 : text.length > 20 ? 48 : 64;
      const svg = `<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="transparent"/>
        <foreignObject x="20" y="20" width="472" height="472">
          <div xmlns="http://www.w3.org/1999/xhtml" style="display:flex;align-items:center;justify-content:center;height:100%;width:100%;font-family:sans-serif;font-weight:bold;font-size:${fontSize}px;color:white;text-align:center;text-shadow:2px 2px 4px #000;word-wrap:break-word;">${escaped}</div>
        </foreignObject>
      </svg>`;
      const webp = await sharp(Buffer.from(svg)).resize(512, 512).webp().toBuffer();
      const branded = await brandSticker(webp, 'Paxton MD', 'Paxton MD');
      await sock.sendMessage(chatId, { sticker: branded }, { quoted: msg });
    } catch (error) {
      await sock.sendMessage(chatId, { text: `❌ Failed: ${error.message}` }, { quoted: msg });
    }
  }
};
