import { reply } from '../../lib/helpers/reply.js';

export default {
  name: 'setmenuimage',
  ownerOnly: true,
  description: 'Toggle a header image above the text menu (owner). Usage: .setmenuimage on|off',
  async execute(sock, msg, args, prefix, ctx) {
    const v = (args[0] || '').toLowerCase();
    if (!['on', 'off'].includes(v)) return reply(sock, msg, `🖼️ Menu image is *${ctx.getGlobalSettings().menuImage ? 'ON' : 'OFF'}*.\nUsage: ${prefix}setmenuimage on|off`);
    ctx.setGlobalSetting('menuImage', v === 'on');
    await reply(sock, msg, `✅ Menu image turned *${v}*. The menu itself is always plain text.`);
  }
};
