export default {
  name: 'prefixinfo',
  description: 'Show the current command prefix and how to change it.',
  async execute(sock, msg, args, prefix, ctx) {
    const chatId = msg.key.remoteJid;
    await sock.sendMessage(chatId, {
      text: `💬 Current prefix: *${prefix}*\n\nTo change it: ${prefix}setprefix <new prefix>${ctx.isPrefixless ? '\n\n(Prefixless mode is also on — commands work with or without the prefix.)' : ''}`
    }, { quoted: msg });
  }
};
