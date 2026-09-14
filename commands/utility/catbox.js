export default {
  name: 'catbox',
  description: 'Upload a replied image/video/audio file and get a permanent catbox.moe link. Usage: reply to media with .catbox',
  async execute(sock, msg, args, currentPrefix, ctx) {
    const chatId = msg.key.remoteJid;
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const media = msg.message?.imageMessage || msg.message?.videoMessage || msg.message?.audioMessage
      || quoted?.imageMessage || quoted?.videoMessage || quoted?.audioMessage;
    if (!media) return sock.sendMessage(chatId, { text: '❌ Reply to an image, video, or audio file with .catbox' }, { quoted: msg });
    try {
      const { API_KEYS, hasKey } = await import('../../api/keys.js');
      if (!hasKey('WOLVAREX_API_KEY')) return sock.sendMessage(chatId, { text: '❌ WOLVAREX_API_KEY is not set — add it to .env' }, { quoted: msg });
      const { downloadContentFromMessage } = await import('@whiskeysockets/baileys');
      const type = msg.message?.imageMessage || quoted?.imageMessage ? 'image' : msg.message?.videoMessage || quoted?.videoMessage ? 'video' : 'audio';
      const stream = await downloadContentFromMessage(media, type);
      const chunks = [];
      for await (const chunk of stream) chunks.push(chunk);
      const buffer = Buffer.concat(chunks);
      const form = new FormData();
      form.append('file', new Blob([buffer]), 'upload.bin');
      const res = await fetch(`https://apix.wolvarex.com/api/url/catbox?key=${API_KEYS.WOLVAREX_API_KEY}`, { method: 'POST', body: form });
      const data = await res.json();
      const link = data?.result?.url || data?.url || data?.result;
      if (!link) return sock.sendMessage(chatId, { text: '❌ Upload failed — no link returned.' }, { quoted: msg });
      await sock.sendMessage(chatId, { text: `📤 *Uploaded:*\n${link}` }, { quoted: msg });
    } catch (error) {
      await sock.sendMessage(chatId, { text: `❌ Upload failed: ${error.message}` }, { quoted: msg });
    }
  }
};
