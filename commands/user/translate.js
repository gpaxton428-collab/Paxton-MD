import { translateText } from '../../lib/api/ai.js';
import { reply, replyError, usage } from '../../lib/helpers/reply.js';

const CODE = /^[a-zA-Z]{2,3}([-_][a-zA-Z]{2,4})?$/;

export default {
  name: 'translate',
  alias: ['tr'],
  description: 'Translate text. Usage: .translate es Hello  — or reply to a message with .translate fr',
  async execute(sock, msg, args, prefix) {
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const quotedText = quoted?.conversation || quoted?.extendedTextMessage?.text || quoted?.imageMessage?.caption || '';
    let lang = 'en';
    let words = [...args];
    if (words.length && CODE.test(words[0]) && (words.length > 1 || quotedText)) lang = words.shift();
    const text = words.join(' ') || quotedText;
    if (!text) return reply(sock, msg, usage(prefix, 'translate <lang> <text>', 'translate fr Good morning'));
    try {
      const out = await translateText(text, lang);
      await reply(sock, msg, `🌐 *${lang.toUpperCase()}*\n\n${out.text}`);
    } catch (err) { await replyError(sock, msg, err, 'translate'); }
  }
};
