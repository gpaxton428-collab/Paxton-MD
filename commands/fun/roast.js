import { getTargetJid } from '../../lib/groupHelper.js';

const ROASTS = [
  'took longer to reply than my Wi-Fi takes to reconnect.',
  "has 'main character syndrome' in a side character's storyline.",
  'types "lol" but has never laughed in their life.',
  'is proof that Wi-Fi signal is stronger than their signal to reply on time.',
  'thinks they are funny — bless their heart.'
];

export default {
  name: 'roast',
  description: 'Send a lighthearted, playful roast. Reply to or mention someone.',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const target = getTargetJid(msg, args);
    if (!target) return sock.sendMessage(chatId, { text: '❌ Reply to or mention who you want to roast (all in good fun!).' }, { quoted: msg });
    const r = ROASTS[Math.floor(Math.random() * ROASTS.length)];
    await sock.sendMessage(chatId, { text: `🔥 @${target.split('@')[0]} ${r}`, mentions: [target] }, { quoted: msg });
  }
};
