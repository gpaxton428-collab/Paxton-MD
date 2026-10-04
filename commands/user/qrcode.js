import { safeErrorMessage } from '../../lib/utils/errors.js';
export default {
  name: 'qrcode',
  alias: ['qr'],
  description: 'Generate a QR code image from text — generated locally, no external service. Usage: .qrcode https://example.com',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const text = args.join(' ');
    if (!text) return sock.sendMessage(chatId, { text: '❌ Usage: .qrcode <text or link>' }, { quoted: msg });
    if (text.length > 1000) return sock.sendMessage(chatId, { text: '❌ That is too long for a QR code (max 1000 characters).' }, { quoted: msg });
    try {
      const QRCode = (await import('qrcode')).default;
      const buffer = await QRCode.toBuffer(text, { width: 400, margin: 2 });
      await sock.sendMessage(chatId, { image: buffer, caption: `📱 QR code for: ${text}` }, { quoted: msg });
    } catch (error) {
      await sock.sendMessage(chatId, { text: `❌ Failed to generate QR code: ${safeErrorMessage(error)}` }, { quoted: msg });
    }
  }
};
