import { getAiReply } from '../../lib/aiApi.js';
import { cleanPrompt } from '../../lib/api/ai.js';
import { AppError } from '../../lib/utils/errors.js';
import { reply, replyError, usage } from '../../lib/helpers/reply.js';

export default {
  name: 'gpt4',
  alias: ['gpt', 'aichat', 'ai'],
  description: 'Ask the AI a question (uses your own provider key if set, otherwise Wolvarex GPT). Usage: .gpt4 <question>',
  async execute(sock, msg, args, prefix) {
    const chatId = msg.key.remoteJid;
    if (!args.length) return reply(sock, msg, usage(prefix, 'gpt4 <question>', 'gpt4 give me 3 dinner ideas'));
    try {
      const prompt = cleanPrompt(args.join(' '));
      sock.sendPresenceUpdate('composing', chatId).catch(() => {});
      const text = await getAiReply(prompt);
      if (!text) throw new AppError('No AI provider produced a reply', { kind: 'api' });
      await reply(sock, msg, text);
    } catch (err) {
      await replyError(sock, msg, err, 'gpt4');
    } finally {
      sock.sendPresenceUpdate('paused', chatId).catch(() => {});
    }
  }
};
