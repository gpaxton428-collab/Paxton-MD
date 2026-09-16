import { hasKey } from '../../api/keys.js';

export default {
  name: 'aiprovider',
  alias: ['aistatus'],
  description: 'Show which AI provider is currently configured and which one will actually be used. Usage: .aiprovider',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    // Same priority order as lib/aiApi.js
    const order = [
      ['ANTHROPIC_API_KEY', 'Anthropic (Claude)'],
      ['OPENAI_API_KEY', 'OpenAI (GPT-4o mini)'],
      ['GEMINI_API_KEY', 'Google Gemini'],
      ['GROQ_API_KEY', 'Groq (Llama 3.3 70B)']
    ];
    const lines = order.map(([key, label]) => `${hasKey(key) ? '✅' : '⬜'} ${label}`);
    const active = order.find(([key]) => hasKey(key));
    const text = `🤖 *AI Provider Status*\n${lines.join('\n')}\n\n${active ? `Currently using: *${active[1]}*` : '⚠️ No AI provider configured — .gpt4 and the chatbot will not work.'}`;
    await sock.sendMessage(chatId, { text }, { quoted: msg });
  }
};
