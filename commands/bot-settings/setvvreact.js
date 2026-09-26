export default {
  name: 'setvvreact',
  alias: ['vvreact'],
  ownerOnly: true,
  description: 'Toggle: reacting to a view-once photo/video with ANY emoji sends it to the reactor\'s own DM (owner only). Usage: .setvvreact on|off',
  async execute(sock, msg, args, prefix, ctx) {
    const chatId = msg.key.remoteJid;
    const choice = (args[0] || '').toLowerCase();
    if (choice !== 'on' && choice !== 'off') {
      const s = ctx.getGlobalSettings();
      return sock.sendMessage(chatId, { text: `ℹ️ Reaction view-once capture is *${s.vvReactCapture ? 'ON' : 'OFF'}*.\nReact to a view-once photo/video with any emoji to get a copy in your own DM.\nUsage: ${prefix}setvvreact on|off` }, { quoted: msg });
    }
    ctx.setGlobalSetting('vvReactCapture', choice === 'on');
    await sock.sendMessage(chatId, { text: `✅ Reaction view-once capture turned *${choice.toUpperCase()}*.` }, { quoted: msg });
  }
};
