import util from 'util';
import { config } from '../../config/index.js';
import { logger } from '../../lib/utils/logger.js';
import { redact } from '../../lib/utils/redact.js';

export default {
  name: 'eval',
  alias: ['>'],
  ownerOnly: true,
  strictOwner: true,
  description: 'Run JavaScript for debugging (owner only; disabled unless ENABLE_EVAL=true).',
  async execute(sock, msg, args, prefix, ctx) {
    const chatId = msg.key.remoteJid;
    if (!config.security.enableEval) {
      return sock.sendMessage(chatId, { text: '🔒 *.eval is disabled.*\nSet ENABLE_EVAL=true in the environment and restart to enable it. This command runs arbitrary code — only enable it if you need it.' }, { quoted: msg });
    }
    if (!ctx.isOwner?.()) return sock.sendMessage(chatId, { text: '❌ *Owner Only Command*' }, { quoted: msg });
    const code = args.join(' ');
    if (!code) return sock.sendMessage(chatId, { text: '❌ Usage: .eval <js expression>' }, { quoted: msg });
    logger.warn('eval', `owner ran .eval (${code.length} chars)`);
    try {
      let result = await eval(code);
      if (typeof result !== 'string') result = util.inspect(result, { depth: 1 });
      const fence = '```';
      await sock.sendMessage(chatId, { text: `${fence}${redact(result).slice(0, 3500)}${fence}` }, { quoted: msg });
    } catch (error) {
      await sock.sendMessage(chatId, { text: `❌ Error: ${redact(error.message)}` }, { quoted: msg });
    }
  }
};
