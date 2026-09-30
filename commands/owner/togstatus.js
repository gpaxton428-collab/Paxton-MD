export default {
  name: 'togstatus',
  ownerOnly: true,
  description: "Post a replied message (image/video/text) — or text you type after the command — to WhatsApp Status. Run it from a group to make that group's members the visible audience. Usage: reply with .togstatus, or .togstatus <text>",
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const typedText = args.join(' ');

    // WhatsApp Status isn't tied to groups — it's a broadcast to your
    // contacts. Without an explicit statusJidList, some clients won't
    // surface the post to anyone at all. Running this from a group uses
    // that group's members as the audience, which is the closest real
    // equivalent to "post this status to the group".
    let statusJidList;
    try {
      if (chatId.endsWith('@g.us')) {
        const metadata = await sock.groupMetadata(chatId);
        const botNumber = sock.user?.id?.split(':')[0];
        statusJidList = metadata.participants.map((p) => p.id).filter((id) => id.split('@')[0] !== botNumber);
      }
    } catch {}

    try {
      const baseOptions = statusJidList?.length ? { statusJidList, broadcast: true } : {};
      if (quoted?.imageMessage) {
        const { downloadContentFromMessage } = await import('@whiskeysockets/baileys');
        const stream = await downloadContentFromMessage(quoted.imageMessage, 'image');
        const chunks = [];
        for await (const chunk of stream) chunks.push(chunk);
        await sock.sendMessage('status@broadcast', { image: Buffer.concat(chunks), caption: quoted.imageMessage.caption || typedText || '' }, baseOptions);
      } else if (quoted?.videoMessage) {
        const { downloadContentFromMessage } = await import('@whiskeysockets/baileys');
        const stream = await downloadContentFromMessage(quoted.videoMessage, 'video');
        const chunks = [];
        for await (const chunk of stream) chunks.push(chunk);
        await sock.sendMessage('status@broadcast', { video: Buffer.concat(chunks), caption: quoted.videoMessage.caption || typedText || '' }, baseOptions);
      } else {
        const quotedText = quoted?.conversation || quoted?.extendedTextMessage?.text;
        const content = quotedText || typedText;
        if (!content) return sock.sendMessage(chatId, { text: '❌ Reply to text/image/video with .togstatus, or use .togstatus <text>' }, { quoted: msg });
        await sock.sendMessage('status@broadcast', { text: content }, baseOptions);
      }
      await sock.sendMessage(chatId, { text: `✅ Posted to status${statusJidList?.length ? ` (visible to this group's ${statusJidList.length} members)` : ''}.` }, { quoted: msg });
    } catch (error) {
      await sock.sendMessage(chatId, { text: `❌ Failed: ${error.message}` }, { quoted: msg });
    }
  }
};
