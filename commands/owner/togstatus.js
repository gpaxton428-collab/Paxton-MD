export default {
  name: 'togstatus',
  ownerOnly: true,
  description: "Post a replied message (image/video/text) — or text you type after the command — to the bot's own WhatsApp Status. Usage: reply with .togstatus, or .togstatus <text>",
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const typedText = args.join(' ');

    // WhatsApp status privacy hides a status update from anyone who isn't
    // explicitly listed as a viewer via statusJidList — this is why status
    // posted from a group never showed up for that group's members. When
    // the command is run inside a group, pull the participant list and
    // pass it along so they're included as viewers.
    let statusJidList;
    if (chatId.endsWith('@g.us')) {
      try {
        const metadata = await sock.groupMetadata(chatId);
        statusJidList = metadata.participants.map((p) => p.id).filter((jid) => jid !== sock.user?.id);
      } catch {
        statusJidList = undefined;
      }
    }
    const statusOptions = statusJidList && statusJidList.length ? { statusJidList, backgroundColor: '#000000' } : {};

    try {
      let sentStatusMsg;
      if (quoted?.imageMessage) {
        const { downloadContentFromMessage } = await import('@whiskeysockets/baileys');
        const stream = await downloadContentFromMessage(quoted.imageMessage, 'image');
        const chunks = [];
        for await (const chunk of stream) chunks.push(chunk);
        sentStatusMsg = await sock.sendMessage('status@broadcast', { image: Buffer.concat(chunks), caption: quoted.imageMessage.caption || typedText || '' }, statusOptions);
      } else if (quoted?.videoMessage) {
        const { downloadContentFromMessage } = await import('@whiskeysockets/baileys');
        const stream = await downloadContentFromMessage(quoted.videoMessage, 'video');
        const chunks = [];
        for await (const chunk of stream) chunks.push(chunk);
        sentStatusMsg = await sock.sendMessage('status@broadcast', { video: Buffer.concat(chunks), caption: quoted.videoMessage.caption || typedText || '' }, statusOptions);
      } else {
        const quotedText = quoted?.conversation || quoted?.extendedTextMessage?.text;
        const content = quotedText || typedText;
        if (!content) return sock.sendMessage(chatId, { text: '❌ Reply to text/image/video with .togstatus, or use .togstatus <text>' }, { quoted: msg });
        sentStatusMsg = await sock.sendMessage('status@broadcast', { text: content }, statusOptions);
      }
      // Quoting the actual status message we just sent (rather than just
      // describing it in plain text) is what makes WhatsApp render the
      // real green "Status" card in the chat, instead of a plain bubble.
      if (chatId.endsWith('@g.us') && sentStatusMsg) {
        try {
          await sock.sendMessage(chatId, { text: '📸 New status posted — tap above to view.' }, { quoted: sentStatusMsg });
        } catch {}
      }
      await sock.sendMessage(chatId, { text: '✅ Posted to status.' }, { quoted: msg });
    } catch (error) {
      await sock.sendMessage(chatId, { text: `❌ Failed: ${error.message}` }, { quoted: msg });
    }
  }
};
