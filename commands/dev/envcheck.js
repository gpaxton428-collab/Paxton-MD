import { hasKey } from '../../config/keys.js';
import { config } from '../../config/index.js';

const KEYS = ['WOLVAREX_API_KEY', 'OPENAI_API_KEY', 'ANTHROPIC_API_KEY', 'GEMINI_API_KEY', 'GROQ_API_KEY', 'REMOVEBG_API_KEY', 'OPENWEATHER_API_KEY'];

export default {
  name: 'envcheck',
  ownerOnly: true,
  strictOwner: true,
  description: 'Show which API keys/settings are configured (values are never shown). Usage: .envcheck',
  async execute(sock, msg) {
    const lines = KEYS.map((k) => `${hasKey(k) ? '✅' : '❌'} ${k}`);
    const flags = [
      `${config.security.enableEval ? '⚠️ ON' : '✅ off'} ENABLE_EVAL`,
      `${config.security.devNumbers.length ? `⚠️ ${config.security.devNumbers.length} number(s)` : '✅ none'} DEV_NUMBERS`,
      `${config.security.updateRepo ? '✅ set' : '⬜ not set'} UPDATE_REPO`
    ];
    await sock.sendMessage(msg.key.remoteJid, { text: `🔑 *Environment*\n\n${lines.join('\n')}\n\n${flags.join('\n')}\n\nA missing key only disables the related feature — the bot still runs.` }, { quoted: msg });
  }
};
