import { replyText } from '../../lib/groupHelper.js';
import { getGroupSettings } from '../../lib/settingsStore.js';

export default {
  name: 'protectionstatus',
  alias: ['groupprotection'],
  description: 'Show a summary of all group protection settings at once. Usage: .protectionstatus',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    if (!chatId.endsWith('@g.us')) return replyText(sock, msg, '❌ This command only works in groups.');
    const s = getGroupSettings(chatId);
    const line = (label, value) => `${value ? '✅' : '❌'} ${label}`;
    const text = [
      '🛡️ *Protection Status*',
      line('Anti-link', s.antilink),
      line('Anti-badword', s.antibadword),
      line('Anti-tag', s.antitag),
      line('Anti-demote', s.antidemote),
      line('Anti-promote', s.antipromote),
      line('Anti-spam', s.antispam),
      line('Anti-fake', s.antifake)
    ].join('\n');
    await replyText(sock, msg, text);
  }
};
