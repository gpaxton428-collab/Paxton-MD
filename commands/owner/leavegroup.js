export default {
  name: 'leavegroup',
  alias: ['leave'],
  ownerOnly: true,
  description: 'Make the bot leave the current group (owner only).',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    if (!chatId.endsWith('@g.us')) return sock.sendMessage(chatId, { text: '❌ This command only works in groups.' }, { quoted: msg });
    await sock.sendMessage(chatId, { text: '👋 Leaving this group...' }, { quoted: msg });
    try { await sock.groupLeave(chatId); } catch {}
  }
};
