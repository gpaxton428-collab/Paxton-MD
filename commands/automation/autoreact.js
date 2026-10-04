export default {
  name: 'autoreact',
  ownerOnly: true,
  description: 'Toggle the bot reacting with ⚡ to every command it receives (owner only). Usage: .autoreact on/off',
  async execute(sock, msg, args, currentPrefix, ctx) {
    const chatId = msg.key.remoteJid;
    const choice = (args[0] || '').toLowerCase();
    if (choice !== 'on' && choice !== 'off') return sock.sendMessage(chatId, { text: '❌ Usage: .autoreact on/off' }, { quoted: msg });
    ctx.setGlobalSetting('autoReact', choice === 'on');
    await sock.sendMessage(chatId, { text: `✅ Auto-react ${choice === 'on' ? 'enabled ⚡' : 'disabled'}.` }, { quoted: msg });
  }
};
