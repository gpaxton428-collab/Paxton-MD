export default {
  name: 'listgroups',
  ownerOnly: true,
  description: 'List every group the bot is currently in (owner only).',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    try {
      const groups = await sock.groupFetchAllParticipating();
      const list = Object.values(groups);
      if (list.length === 0) return sock.sendMessage(chatId, { text: 'ℹ️ Not in any groups yet.' }, { quoted: msg });
      const lines = list.map((g) => `• ${g.subject} (${g.participants.length} members)`);
      await sock.sendMessage(chatId, { text: `📋 *GROUPS (${list.length})*\n\n${lines.join('\n')}` }, { quoted: msg });
    } catch (error) {
      await sock.sendMessage(chatId, { text: `❌ Failed to list groups: ${error.message}` }, { quoted: msg });
    }
  }
};
