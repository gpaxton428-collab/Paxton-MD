import { getTargetJid } from '../../lib/groupHelper.js';

const COMPLIMENTS = [
  'has great taste and even better energy.',
  'makes every group chat more fun.',
  'is sharper than they give themselves credit for.',
  'has main character energy today.',
  'is the reason this group has good vibes.'
];

export default {
  name: 'compliment',
  description: 'Send a random compliment. Reply to or mention someone, or leave blank for yourself.',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const target = getTargetJid(msg, args) || msg.key.participant || chatId;
    const c = COMPLIMENTS[Math.floor(Math.random() * COMPLIMENTS.length)];
    await sock.sendMessage(chatId, { text: `✨ @${target.split('@')[0]} ${c}`, mentions: [target] }, { quoted: msg });
  }
};
