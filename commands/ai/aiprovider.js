import { hasKey } from '../../config/keys.js';
import { reply } from '../../lib/helpers/reply.js';

export default {
  name: 'aiprovider',
  alias: ['aistatus'],
  description: 'Show which AI providers are configured and which one .gpt4 will use. Usage: .aiprovider',
  async execute(sock, msg) {
    // Same priority order as lib/aiApi.js
    const order = [
      ['ANTHROPIC_API_KEY', 'Anthropic (Claude)'],
      ['OPENAI_API_KEY', 'OpenAI (GPT-4o mini)'],
      ['GEMINI_API_KEY', 'Google Gemini'],
      ['GROQ_API_KEY', 'Groq (own key)'],
      ['WOLVAREX_API_KEY', 'Wolvarex GPT (fallback)']
    ];
    const lines = order.map(([key, label]) => `${hasKey(key) ? '✅' : '⬜'} ${label}`);
    const active = order.find(([key]) => hasKey(key));
    await reply(sock, msg, `🤖 *AI Provider Status*\n\n${lines.join('\n')}\n\n${active ? `Currently using: *${active[1]}*` : '⚠️ No AI provider configured — .gpt4 and the chatbot will not work.'}`);
  }
};
