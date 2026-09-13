import fs from 'fs';

const NAME_FILE = './data/botname.json';

export default {
  name: 'setbotname',
  ownerOnly: true,
  description: "Change the bot's display name (owner only) — updates the menu header immediately. Usage: .setbotname Paxton MD",
  async execute(sock, msg, args, prefix, ctx) {
    const chatId = msg.key.remoteJid;
    const newName = args.join(' ').trim();
    if (!newName) return sock.sendMessage(chatId, { text: '❌ Usage: .setbotname <name>' }, { quoted: msg });
    try {
      if (!fs.existsSync('./data')) fs.mkdirSync('./data', { recursive: true });
      fs.writeFileSync(NAME_FILE, JSON.stringify({ name: newName, setAt: new Date().toISOString() }, null, 2));
      ctx.setBotName(newName); // updates it live — no restart needed, shows up in .menu right away
      try { await sock.updateProfileName(newName); } catch {}
      await sock.sendMessage(chatId, { text: `✅ Bot name changed to *${newName}* — updated on WhatsApp and in the menu.` }, { quoted: msg });
    } catch (error) {
      await sock.sendMessage(chatId, { text: `❌ Failed: ${error.message}` }, { quoted: msg });
    }
  }
};
