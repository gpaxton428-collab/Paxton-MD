import { safeErrorMessage } from '../../lib/utils/errors.js';
import fs from 'fs';
import { writeJsonSync } from '../../lib/utils/jsonStore.js';

const MODES = ['public', 'private', 'silent', 'group-only', 'maintenance'];
const BOT_MODE_FILE = './bot_mode.json';

export default {
  name: 'mode',
  ownerOnly: true,
  description: 'Set the bot access mode (owner only). Usage: .mode public|private|silent|group-only|maintenance',
  async execute(sock, msg, args, prefix, ctx) {
    const chatId = msg.key.remoteJid;
    const choice = (args[0] || '').toLowerCase();
    if (!MODES.includes(choice)) {
      return sock.sendMessage(chatId, { text: `❌ Usage: .mode <${MODES.join('|')}>` }, { quoted: msg });
    }
    try {
      writeJsonSync(BOT_MODE_FILE, { mode: choice, setAt: new Date().toISOString() });
      ctx.setBotMode(choice); // apply immediately — no restart needed
      await sock.sendMessage(chatId, { text: `✅ Bot mode set to *${choice}*.` }, { quoted: msg });
    } catch (error) {
      await sock.sendMessage(chatId, { text: `❌ Failed to set mode: ${safeErrorMessage(error)}` }, { quoted: msg });
    }
  }
};
