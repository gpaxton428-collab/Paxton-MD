import { STYLE_COUNT, STYLE_DESCRIPTIONS } from '../../lib/menu/styles.js';
import { SCOPE_NAMES } from '../../lib/menu/scopes.js';
import { reply } from '../../lib/helpers/reply.js';

export default {
  name: 'menustyle',
  ownerOnly: true,
  description: `Switch the .menu layout (owner). Usage: .menustyle <1-${STYLE_COUNT}> [${SCOPE_NAMES.join('|')}|all]`,
  async execute(sock, msg, args, prefix, ctx) {
    const settings = ctx.getGlobalSettings();
    const choice = parseInt(args[0], 10);
    if (!args[0]) {
      const per = Object.entries(settings.menuStyles || {}).map(([k, v]) => `${k}=${v}`).join(', ');
      return reply(sock, msg, `🎨 *Menu style*\nDefault: ${settings.menuStyle || 1}${per ? `\nPer view: ${per}` : ''}\n\n${Object.entries(STYLE_DESCRIPTIONS).map(([n, d]) => `*${n}.* ${d}`).join('\n')}\n\nUsage: ${prefix}menustyle <1-${STYLE_COUNT}> [${SCOPE_NAMES.join('|')}|all]`);
    }
    if (!Number.isInteger(choice) || choice < 1 || choice > STYLE_COUNT) return reply(sock, msg, `❌ Usage: ${prefix}menustyle <1-${STYLE_COUNT}> [${SCOPE_NAMES.join('|')}|all]`);
    const target = (args[1] || 'all').toLowerCase();
    if (target === 'all') {
      ctx.setGlobalSetting('menuStyle', choice);
      ctx.setGlobalSetting('menuStyles', {});
      return reply(sock, msg, `✅ Menu style set to *${choice}* for every view. Send ${prefix}menu to see it.`);
    }
    if (!SCOPE_NAMES.includes(target)) return reply(sock, msg, `❌ Unknown view "${target.slice(0, 20)}". Use one of: ${SCOPE_NAMES.join(', ')}, all.`);
    ctx.setGlobalSetting('menuStyles', { ...(settings.menuStyles || {}), [target]: choice });
    await reply(sock, msg, `✅ The *${target}* menu now uses style *${choice}*. Try ${prefix}menu ${target}.`);
  }
};
