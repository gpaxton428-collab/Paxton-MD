import { isSenderAdmin } from '../../lib/groupHelper.js';
import { STYLE_COUNT } from '../../lib/menu/styles.js';
import { reply } from '../../lib/helpers/reply.js';

export default {
  name: 'setmenustyle',
  description: `Set the .menu style for THIS group only (group admin). Usage: .setmenustyle <1-${STYLE_COUNT}> or .setmenustyle reset`,
  async execute(sock, msg, args, prefix, ctx) {
    const chatId = msg.key.remoteJid;
    if (!chatId.endsWith('@g.us')) return reply(sock, msg, '❌ This command only works in groups. Owners can set the bot-wide default with .menustyle.');
    const sender = msg.key.participant || chatId;
    if (!ctx.isOwnerOrSudo?.() && !(await isSenderAdmin(sock, chatId, sender))) return reply(sock, msg, '❌ Only group admins can use this command.');
    if ((args[0] || '').toLowerCase() === 'reset') {
      ctx.setGroupSetting(chatId, 'menuStyle', null);
      return reply(sock, msg, '✅ This group now follows the bot-wide menu style again.');
    }
    const choice = parseInt(args[0], 10);
    if (!Number.isInteger(choice) || choice < 1 || choice > STYLE_COUNT) return reply(sock, msg, `❌ Usage: ${prefix}setmenustyle <1-${STYLE_COUNT}> (or "reset")`);
    ctx.setGroupSetting(chatId, 'menuStyle', choice);
    await reply(sock, msg, `✅ This group's menu style is now *${choice}*. Send ${prefix}menu to see it.`);
  }
};
