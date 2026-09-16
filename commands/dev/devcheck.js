export default {
  name: 'devcheck',
  ownerOnly: true,
  description: 'Show dev-react config, last logged error, and confirm dev commands are loaded (owner only). Usage: .devcheck',
  async execute(sock, msg, args, currentPrefix, ctx) {
    const chatId = msg.key.remoteJid;
    const devCmds = ctx.commandCategories.get('dev') || [];
    const cacheSize = globalThis.devLidCache ? globalThis.devLidCache.size : 0;
    const debugOn = process.env.DEV_REACT_DEBUG === 'true';
    const lastError = global.__paxtonLastError;
    const text = `╭─❏ 🎨『 *DEV CHECK* 』🎨\n` +
      `├❏ 👑 Dev-react target: 27697344852\n` +
      `├❏ 🗂️ Cached @lid resolutions: ${cacheSize}\n` +
      `├❏ 🐞 DEV_REACT_DEBUG: ${debugOn ? 'ON' : 'off'} ${debugOn ? '' : '(set DEV_REACT_DEBUG=true in .env if the crown react ever misses)'}\n` +
      `├❏ 📦 Total commands loaded: ${ctx.getTotalCommandCount()}\n` +
      `├❏ 🛠️ Dev commands loaded: ${devCmds.length}\n` +
      `├❏ 📋 ${devCmds.join(', ') || 'none'}\n` +
      `├❏ ⚠️ Last error: ${lastError ? `${lastError.time} — ${lastError.message.slice(0, 200)}` : 'none since startup'}\n` +
      `╰─❏ ᴘᴏᴡᴇʀᴇᴅ ʙʏ Paxton-Tech`;
    await sock.sendMessage(chatId, { text }, { quoted: msg });
  }
};
