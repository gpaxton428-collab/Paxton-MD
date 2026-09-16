import { replyText } from '../../lib/groupHelper.js';

export default {
  name: 'poll',
  description: 'Create a poll. Usage: .poll Question | Option1 | Option2 | Option3',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const raw = args.join(' ');
    const parts = raw.split('|').map((p) => p.trim()).filter(Boolean);
    if (parts.length < 3) return replyText(sock, msg, '❌ Usage: .poll Question | Option1 | Option2 | ...');
    const [question, ...options] = parts;
    try {
      await sock.sendMessage(chatId, {
        poll: { name: question, values: options.slice(0, 12), selectableCount: 1 }
      }, { quoted: msg });
    } catch (error) {
      await replyText(sock, msg, `❌ Failed to create poll: ${error.message}`);
    }
  }
};
