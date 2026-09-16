export default {
  name: 'runtime',
  alias: ['uptime'],
  description: "Show how long the bot has been running plus WhatsApp connection status. Usage: .runtime",
  async execute(sock, msg, args, currentPrefix, ctx) {
    const chatId = msg.key.remoteJid;
    const uptimeSec = process.uptime();
    const d = Math.floor(uptimeSec / 86400);
    const h = Math.floor((uptimeSec % 86400) / 3600);
    const m = Math.floor((uptimeSec % 3600) / 60);
    const s = Math.floor(uptimeSec % 60);
    const parts = [];
    if (d) parts.push(`${d}d`);
    if (h || d) parts.push(`${h}h`);
    parts.push(`${m}m`, `${s}s`);
    const connected = ctx.isWhatsAppConnected ? ctx.isWhatsAppConnected() : true;
    const text = `╭─❏ ◈『 *RUNTIME* 』◈\n├❏ ✧ *Uptime:* ${parts.join(' ')}\n├❏ ✧ *WhatsApp Status:* ${connected ? '🟢 Connected' : '🔴 Disconnected'}\n╰─❏ ᴘᴏᴡᴇʀᴇᴅ ʙʏ Paxton-Tech`;
    await sock.sendMessage(chatId, { text }, { quoted: msg });
    sock.sendMessage(chatId, { react: { text: '💎', key: msg.key } }).catch(() => {});
  }
};
