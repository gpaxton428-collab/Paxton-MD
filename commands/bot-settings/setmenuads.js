import { config } from '../../config/index.js';
import { getAds } from '../../lib/menu/ads.js';
import { reply } from '../../lib/helpers/reply.js';

export default {
  name: 'setmenuads',
  alias: ['menuads'],
  ownerOnly: true,
  description: 'Configure the advertisement block shown in .menu (owner). Usage: .setmenuads on|off|reset|<text>',
  async execute(sock, msg, args, prefix, ctx) {
    const s = ctx.getGlobalSettings();
    const arg = args.join(' ').trim();
    if (!arg) {
      const ads = getAds(s);
      return reply(sock, msg, `📢 *Menu ads:* ${ads ? 'ON' : 'OFF'}\n${ads ? `\nPreview:\n${ads}\n` : ''}\nUsage:\n${prefix}setmenuads on | off | reset\n${prefix}setmenuads <your text>`);
    }
    const lower = arg.toLowerCase();
    if (lower === 'off') { ctx.setGlobalSetting('menuAdsEnabled', false); return reply(sock, msg, '✅ Menu ads turned *off*.'); }
    if (lower === 'on') { ctx.setGlobalSetting('menuAdsEnabled', true); return reply(sock, msg, '✅ Menu ads turned *on*.'); }
    if (lower === 'reset') {
      ctx.setGlobalSetting('menuAdsEnabled', config.menu.adsEnabled);
      ctx.setGlobalSetting('menuAdsText', '');
      return reply(sock, msg, '✅ Menu ads reset to the defaults.');
    }
    if (arg.length > 160) return reply(sock, msg, '❌ Keep the ad text under 160 characters.');
    ctx.setGlobalSetting('menuAdsText', arg);
    ctx.setGlobalSetting('menuAdsEnabled', true);
    await reply(sock, msg, `✅ Ad text updated:\n\n📢 ADVERTISEMENT\n${arg}`);
  }
};
