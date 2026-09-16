import util from 'util';

export default {
  name: 'eval',
  alias: ['>'],
  ownerOnly: true,
  description: 'Run a short JavaScript snippet for debugging (owner only, use with care).',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const code = args.join(' ');
    if (!code) return sock.sendMessage(chatId, { text: '❌ Usage: .eval <js expression>' }, { quoted: msg });
    try {
      let result = await eval(code);
      if (typeof result !== 'string') result = util.inspect(result, { depth: 1 });
      const fence = '```';
      await sock.sendMessage(chatId, { text: `${fence}${result.slice(0, 3500)}${fence}` }, { quoted: msg });
    } catch (error) {
      await sock.sendMessage(chatId, { text: `❌ Error: ${error.message}` }, { quoted: msg });
    }
  }
};
