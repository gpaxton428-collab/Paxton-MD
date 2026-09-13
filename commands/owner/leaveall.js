export default {
  name: 'leaveall',
  ownerOnly: true,
  description: "⚠️ DANGEROUS: makes the bot leave every group it's currently in (owner only). Usage: .leaveall confirm",
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    if ((args[0] || '').toLowerCase() !== 'confirm') {
      return sock.sendMessage(chatId, { text: '⚠️ This makes the bot leave EVERY group it\'s in. This cannot be undone from chat.\nType `.leaveall confirm` if you\'re sure.' }, { quoted: msg });
    }
    try {
      const allChats = await sock.groupFetchAllParticipating();
      const groupIds = Object.keys(allChats);
      await sock.sendMessage(chatId, { text: `🚪 Leaving ${groupIds.length} group(s)...` }, { quoted: msg });
      let left = 0;
      for (const gid of groupIds) {
        if (gid === chatId) continue; // leave the current chat last, so this reply can still send
        try { await sock.groupLeave(gid); left++; } catch {}
      }
      if (chatId.endsWith('@g.us')) { try { await sock.groupLeave(chatId); left++; } catch {} }
      await sock.sendMessage(msg.key.participant || chatId, { text: `✅ Left ${left} group(s).` }).catch(() => {});
    } catch (error) {
      await sock.sendMessage(chatId, { text: `❌ Failed: ${error.message}` }, { quoted: msg });
    }
  }
};
