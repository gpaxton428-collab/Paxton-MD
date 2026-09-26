import fs from 'fs';
import { hasKey } from '../../config/keys.js';
import { config, envSource, ROOT_DIR } from '../../config/index.js';
import path from 'path';

const KEYS = ['WOLVAREX_API_KEY', 'OPENAI_API_KEY', 'ANTHROPIC_API_KEY', 'GEMINI_API_KEY', 'GROQ_API_KEY', 'REMOVEBG_API_KEY', 'OPENWEATHER_API_KEY'];

// "file" = only in ./.env (or session_id.txt) — wiped by panels that fully
// re-clone the repo on redeploy. "host" = a real panel/host env var — survives.
const sourceNote = (src) => (src === 'host' ? '(host env — persists across redeploys)' : src === 'file' ? '⚠️ (.env file only — will NOT survive a full redeploy/re-clone; set it as a real host env var instead)' : '');

export default {
  name: 'envcheck',
  ownerOnly: true,
  description: 'Show which API keys/settings are configured, and whether each will survive a redeploy. Usage: .envcheck',
  async execute(sock, msg) {
    const lines = KEYS.map((k) => `${hasKey(k) ? '✅' : '❌'} ${k} ${hasKey(k) ? sourceNote(envSource(k)) : ''}`.trim());
    const sessionSrc = envSource('SESSION_ID');
    const sessionFile = fs.existsSync(path.join(ROOT_DIR, 'session_id.txt'));
    const sessionLine = sessionSrc !== 'unset'
      ? `✅ SESSION_ID ${sourceNote(sessionSrc)}`
      : sessionFile
        ? `✅ SESSION_ID ⚠️ (session_id.txt file only — will NOT survive a full redeploy/re-clone)`
        : `❌ SESSION_ID (and no session_id.txt)`;
    const flags = [
      `${config.security.enableEval ? '⚠️ ON' : '✅ off'} ENABLE_EVAL`,
      `${config.security.devNumbers.length ? `⚠️ ${config.security.devNumbers.length} number(s)` : '✅ none'} DEV_NUMBERS`,
      `${config.security.updateRepo ? '✅ set' : '⬜ not set'} UPDATE_REPO`
    ];
    await sock.sendMessage(msg.key.remoteJid, {
      text: `🔑 *Environment*\n\n${sessionLine}\n${lines.join('\n')}\n\n${flags.join('\n')}\n\nA missing key only disables the related feature — the bot still runs.\nOn hosting panels: set values in the panel's own "Environment Variables" screen, not just a .env file, so they survive a redeploy/git push.`
    }, { quoted: msg });
  }
};
