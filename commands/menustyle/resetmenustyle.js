import { reply } from '../../lib/helpers/reply.js';

export default {
  name: 'resetmenustyle',
  ownerOnly: true,
  description: 'Reset the menu to the default style (1) for every view (owner). Usage: .resetmenustyle',
  async execute(sock, msg, args, prefix, ctx) {
    ctx.setGlobalSetting('menuStyle', 1);
    ctx.setGlobalSetting('menuStyles', {});
    await reply(sock, msg, `✅ Menu style reset to the default (1) for every view. Send ${prefix}menu to view it.`);
  }
};
