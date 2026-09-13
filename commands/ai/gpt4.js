import { getAiReply } from '../../lib/aiApi.js';

export default {
  name: 'gpt4',
  alias: ['gpt', 'aichat', 'ai'],
  description: 'Ask the AI a question. Usage: .gpt4 <question>',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const prompt = args.join(' ');
    if (!prompt) return sock.sendMessage(chatId, { text: '❌ Usage: .gpt4 <question>' }, { quoted: msg });
    try {
      await sock.sendPresenceUpdate('composing', chatId).catch(() => {});
      const reply = await getAiReply(prompt);
      if (!reply) return sock.sendMessage(chatId, { text: '❌ No response from the AI right now — try again shortly.' }, { quoted: msg });
      await sock.sendMessage(chatId, { text: reply }, { quoted: msg });
    } catch (error) {
      await sock.sendMessage(chatId, { text: `❌ AI request failed: ${error.message}` }, { quoted: msg });
    }
  }
};
