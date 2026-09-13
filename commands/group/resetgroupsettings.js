import fs from 'fs';
import path from 'path';
import { isSenderAdmin, replyText } from '../../lib/groupHelper.js';

export default {
  name: 'resetgroupsettings',
  description: 'Reset this group\'s toggles (welcome, antilink, rules, warnings, etc.) back to defaults (admin only).',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    if (!chatId.endsWith('@g.us')) return replyText(sock, msg, '❌ This command only works in groups.');
    const sender = msg.key.participant || msg.key.remoteJid;
    if (!(await isSenderAdmin(sock, chatId, sender))) return replyText(sock, msg, '❌ Only group admins can use this command.');
    try {
      const file = path.join(process.cwd(), 'data', 'group_settings.json');
      if (fs.existsSync(file)) {
        const all = JSON.parse(fs.readFileSync(file, 'utf8'));
        delete all[chatId];
        fs.writeFileSync(file, JSON.stringify(all, null, 2));
      }
      await replyText(sock, msg, '✅ This group\'s settings were reset to defaults.');
    } catch (error) {
      await replyText(sock, msg, `❌ Failed: ${error.message}`);
    }
  }
};
