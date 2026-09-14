export default {
  name: 'qrcode',
  alias: ['qr'],
  description: 'Generate a QR code image from text. Usage: .qrcode https://example.com',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const text = args.join(' ');
    if (!text) return sock.sendMessage(chatId, { text: '❌ Usage: .qrcode <text or link>' }, { quoted: msg });
    try {
      const url = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(text)}`;
      const res = await fetch(url);
      const buffer = Buffer.from(await res.arrayBuffer());
      await sock.sendMessage(chatId, { image: buffer, caption: `📱 QR code for: ${text}` }, { quoted: msg });
    } catch (error) {
      await sock.sendMessage(chatId, { text: `❌ Failed to generate QR code: ${error.message}` }, { quoted: msg });
    }
  }
};
