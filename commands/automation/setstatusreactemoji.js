export default {
  name: 'setstatusreactemoji',
  alias: ['statusemoji'],
  ownerOnly: true,
  description: 'Set (or randomize) the emoji used for auto-status-react. Usage: .setstatusreactemoji <emoji|random>',
  async execute(sock, msg, args, prefix, ctx) {
    const chatId = msg.key.remoteJid;
    const value = (args[0] || '').trim();
    if (!value) return sock.sendMessage(chatId, { text: `❌ Usage: ${prefix}setstatusreactemoji <emoji|random>` }, { quoted: msg });
    if (value.toLowerCase() === 'random') { ctx.setGlobalSetting('statusReactEmoji', ''); return sock.sendMessage(chatId, { text: '✅ Status-react emoji set to random.' }, { quoted: msg }); }
    if ([...value].length > 4) return sock.sendMessage(chatId, { text: '❌ That doesn\'t look like a single emoji.' }, { quoted: msg });
    ctx.setGlobalSetting('statusReactEmoji', value);
    await sock.sendMessage(chatId, { text: `✅ Status-react emoji set to ${value}.` }, { quoted: msg });
  }
};
