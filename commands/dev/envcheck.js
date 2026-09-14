const REQUIRED_KEYS = ['OPENAI_API_KEY', 'ANTHROPIC_API_KEY', 'GEMINI_API_KEY', 'GROQ_API_KEY', 'REMOVEBG_API_KEY', 'OPENWEATHER_API_KEY'];

export default {
  name: 'envcheck',
  ownerOnly: true,
  description: 'Check which optional API keys/env vars are configured on this host (owner only). Usage: .envcheck',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    const lines = REQUIRED_KEYS.map((key) => `${process.env[key] ? '✅' : '❌'} ${key}`);
    await sock.sendMessage(chatId, { text: `🔑 *Env Key Check*\n${lines.join('\n')}\n\nMissing keys just mean the related feature (AI chat, weather, etc) is disabled — the bot itself still runs fine.` }, { quoted: msg });
  }
};
