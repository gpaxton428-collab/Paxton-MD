import { getTargetJid } from '../../lib/groupHelper.js';
import { fetchFun } from '../../lib/api/fun.js';
import { isConfigured } from '../../lib/api/wolvarex.js';
import { logger } from '../../lib/utils/logger.js';
import { reply } from '../../lib/helpers/reply.js';

const ROASTS = [
  'took longer to reply than my Wi-Fi takes to reconnect.',
  "has 'main character syndrome' in a side character's storyline.",
  'types "lol" but has never laughed in their life.',
  'thinks they are funny — bless their heart.'
];

export default {
  name: 'roast',
  description: 'Send a lighthearted, playful roast. Reply to or mention someone. Usage: .roast @user',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const target = getTargetJid(msg, args);
    if (!target) return reply(sock, msg, '❌ Reply to or mention who you want to roast (all in good fun!).');
    let line = null;
    if (isConfigured()) {
      try { line = (await fetchFun('roast')).text; } catch (err) { logger.warn('fun', `roast: API unavailable (${err.kind || 'error'})`); }
    }
    const who = `@${target.split('@')[0]}`;
    const text = line ? `🔥 ${who}, ${line}` : `🔥 ${who} ${ROASTS[Math.floor(Math.random() * ROASTS.length)]}`;
    await sock.sendMessage(chatId, { text, mentions: [target] }, { quoted: msg });
  }
};
