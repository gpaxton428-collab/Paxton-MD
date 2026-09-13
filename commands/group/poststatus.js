export default {
  name: 'poststatus',
  description: "Post text (or a replied image/video) straight to the group chat as an announcement-style status update. Usage: .poststatus <text>, or reply to media with .poststatus",
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const text = args.join(' ');
    try {
      if (quoted?.imageMessage) {
        const { downloadContentFromMessage } = await import('@whiskeysockets/baileys');
        const stream = await downloadContentFromMessage(quoted.imageMessage, 'image');
        const chunks = [];
        for await (const chunk of stream) chunks.push(chunk);
        await sock.sendMessage(chatId, { image: Buffer.concat(chunks), caption: `📢 ${text || quoted.imageMessage.caption || ''}`.trim() });
      } else if (quoted?.videoMessage) {
        const { downloadContentFromMessage } = await import('@whiskeysockets/baileys');
        const stream = await downloadContentFromMessage(quoted.videoMessage, 'video');
        const chunks = [];
        for await (const chunk of stream) chunks.push(chunk);
        await sock.sendMessage(chatId, { video: Buffer.concat(chunks), caption: `📢 ${text || quoted.videoMessage.caption || ''}`.trim() });
      } else {
        if (!text) return sock.sendMessage(chatId, { text: '❌ Usage: .poststatus <text>, or reply to an image/video with .poststatus' }, { quoted: msg });
        await sock.sendMessage(chatId, { text: `📢 *Status:* ${text}` });
      }
    } catch (error) {
      await sock.sendMessage(chatId, { text: `❌ Failed: ${error.message}` }, { quoted: msg });
    }
  }
};
