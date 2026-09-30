export default {
  name: 'antivv',
  alias: ['antiviewonce'],
  ownerOnly: true,
  description: 'Anti-viewonce is always on — no toggle needed. Any view-once photo/video sent to the bot (DM or group) is automatically forwarded to your own DM.',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    await sock.sendMessage(chatId, { text: '✅ Anti-viewonce is always *ON* — no toggle needed. Recovered media is sent straight to your DM.' }, { quoted: msg });
  }
};
