export default {
  name: 'autostatusreact',
  ownerOnly: true,
  description: "Automatically react to everyone's status updates with an emoji (owner only). Usage: .autostatusreact on|off",
  async execute(sock, msg, args, prefix, ctx) {
    const chatId = msg.key.remoteJid;
    const choice = (args[0] || '').toLowerCase();
    if (choice !== 'on' && choice !== 'off') {
      const s = ctx.getGlobalSettings();
      return sock.sendMessage(chatId, { text: `ℹ️ Auto-status-react is *${s.autoStatusReact ? 'ON' : 'OFF'}*${s.statusReactEmoji ? ` (${s.statusReactEmoji})` : ' (random emoji)'}.\nUsage: ${prefix}autostatusreact on|off\n${prefix}setstatusreactemoji <emoji|random>` }, { quoted: msg });
    }
    ctx.setGlobalSetting('autoStatusReact', choice === 'on');
    await sock.sendMessage(chatId, { text: `✅ Auto-status-react turned *${choice.toUpperCase()}*.` }, { quoted: msg });
  }
};
