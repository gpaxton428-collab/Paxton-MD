// NOTE: the wolvarex img-to-sticker endpoint appears to expect a file
// upload (its example URL has no url= param, unlike the other converter
// endpoints), which doesn't fit our simple GET-based helper. Converting
// locally with sharp (already a project dependency) is more reliable
// anyway — no external API call needed for something this simple.
export default {
  name: 'imgtosticker',
  description: 'Convert a replied/quoted image into a sticker. Usage: reply to an image with .imgtosticker',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const imageMsg = msg.message?.imageMessage || quoted?.imageMessage;
    if (!imageMsg) return sock.sendMessage(chatId, { text: '❌ Reply to an image with .imgtosticker' }, { quoted: msg });
    try {
      const { downloadContentFromMessage } = await import('@whiskeysockets/baileys');
      const stream = await downloadContentFromMessage(imageMsg, 'image');
      const chunks = [];
      for await (const chunk of stream) chunks.push(chunk);
      const sharp = (await import('sharp')).default;
      const webp = await sharp(Buffer.concat(chunks)).resize(512, 512, { fit: 'inside' }).webp().toBuffer();
      await sock.sendMessage(chatId, { sticker: webp }, { quoted: msg });
    } catch (error) {
      await sock.sendMessage(chatId, { text: `❌ Conversion failed: ${error.message}` }, { quoted: msg });
    }
  }
};
