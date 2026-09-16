export default {
  name: 'setppbot',
  alias: ['setpp'],
  ownerOnly: true,
  description: "Set the bot's WhatsApp profile picture (owner only). Reply to an image.",
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const imageMsg = quoted?.imageMessage || msg.message?.imageMessage;
    if (!imageMsg) return sock.sendMessage(chatId, { text: '❌ Reply to (or send with caption) an image to use as the profile picture.' }, { quoted: msg });
    try {
      const { downloadContentFromMessage } = await import('@whiskeysockets/baileys');
      const stream = await downloadContentFromMessage(imageMsg, 'image');
      const chunks = [];
      for await (const chunk of stream) chunks.push(chunk);
      const buffer = Buffer.concat(chunks);
      // sock.user.id usually includes a device suffix (":16" etc) — the
      // profile-picture endpoint needs a clean JID without it, same class
      // of bug as the earlier dev-react device-suffix issue.
      const selfJid = sock.user.id.replace(/:\d+/, '');
      await sock.updateProfilePicture(selfJid, buffer);
      await sock.sendMessage(chatId, { text: '✅ Bot profile picture updated.' }, { quoted: msg });
    } catch (error) {
      await sock.sendMessage(chatId, { text: `❌ Failed to update picture: ${error.message}` }, { quoted: msg });
    }
  }
};
