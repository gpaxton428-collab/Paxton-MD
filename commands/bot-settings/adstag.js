import { getAdsCard, getAds, getAdsTag, cleanAdsTag, DEFAULT_ADS_TAG, MAX_ADS_TAG } from '../../lib/menu/ads.js';
import { reply } from '../../lib/helpers/reply.js';

export default {
  name: 'adstag',
  alias: ['setadstag', 'menuadstag'],
  ownerOnly: true,
  description: 'Set the menu ad label and the WhatsApp "Ad" badge (owner). Usage: .adstag <label> | badge on|off | reset',
  async execute(sock, msg, args, prefix, ctx) {
    const s = ctx.getGlobalSettings();
    const arg = args.join(' ').trim();
    const [word, mode] = arg.toLowerCase().split(/\s+/);
    if (word === 'badge' && ['on', 'off'].includes(mode)) {
      ctx.setGlobalSetting('menuAdsBadge', mode === 'on');
      return reply(sock, msg, `✅ WhatsApp "Ad" badge on the menu turned *${mode}*.`);
    }
    if (!arg) {
      const ads = getAds(s);
      return reply(sock, msg, `🏷️ *Ads tag:* ${getAdsTag(s)}\n${ads ? `\nPreview:\n${ads}\n` : '\n(menu ads are currently off — use .setmenuads on)\n'}\nAd badge: ${getAdsCard(s) ? 'ON' : 'OFF'}\n\nUsage:\n${prefix}adstag <label>\n${prefix}adstag badge on|off\n${prefix}adstag reset`);
    }
    if (arg.toLowerCase() === 'reset') {
      ctx.setGlobalSetting('menuAdsTag', '');
      return reply(sock, msg, `✅ Ads tag reset to ${getAdsTag({ ...s, menuAdsTag: '' })}.`);
    }
    const tag = cleanAdsTag(arg);
    if (arg.length > MAX_ADS_TAG) return reply(sock, msg, `❌ Keep the ads tag under ${MAX_ADS_TAG} characters (e.g. ${DEFAULT_ADS_TAG}).`);
    ctx.setGlobalSetting('menuAdsTag', tag);
    await reply(sock, msg, `✅ Ads tag updated:\n\n${getAds({ ...s, menuAdsTag: tag, menuAdsEnabled: true }) || tag}`);
  }
};
