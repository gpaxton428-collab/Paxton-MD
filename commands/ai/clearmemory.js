import { memoryKey, clearHistory } from '../../lib/chatMemory.js';

export default {
  name: 'clearmemory',
  alias: ['forgetme'],
  description: 'Clear the chatbot\'s conversation memory for this chat. Usage: .clearmemory',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    const sender = msg.key.participant || chatId;
    clearHistory(memoryKey(chatId, sender));
    await sock.sendMessage(chatId, { text: '🧹 Chatbot memory cleared for this chat.' }, { quoted: msg });
  }
};
