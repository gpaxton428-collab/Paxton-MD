// Optional, labelled advertisement block. The text is configurable
// with .setmenuads and the label above it (the "ads tag") with .adstag; both
// have environment defaults. It is always labelled so it is never mistaken
// for a WhatsApp/system message.
import { config } from '../../config/index.js';

export const DEFAULT_ADS_TAG = '📢 ADVERTISEMENT';
export const MAX_ADS_TAG = 32;

export function cleanAdsTag(value) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, MAX_ADS_TAG);
}

export function getAdsTag(settings = {}) {
  return cleanAdsTag(settings.menuAdsTag) || cleanAdsTag(config.menu.adsTag) || DEFAULT_ADS_TAG;
}

export function getAds(settings) {
  const enabled = settings.menuAdsEnabled ?? config.menu.adsEnabled;
  if (!enabled) return null;
  const text = String(settings.menuAdsText || config.menu.adsText || '').replace(/\s+/g, ' ').trim().slice(0, 160);
  if (!text) return null;
  return `${getAdsTag(settings)}\n${text}`;
}

// Fake WhatsApp "Ad" badge: an externalAdReply card with showAdAttribution, so
// WhatsApp draws its own "Ad" tag on the menu message. Cosmetic only.
// Toggle with .adstag badge on|off (MENU_ADS_BADGE sets the default).
export function getAdsCard(settings = {}) {
  const enabled = settings.menuAdsEnabled ?? config.menu.adsEnabled;
  const badge = settings.menuAdsBadge ?? config.menu.adsBadge;
  if (!enabled || !badge) return null;
  const text = String(settings.menuAdsText || config.menu.adsText || '').replace(/\s+/g, ' ').trim().slice(0, 160);
  if (!text) return null;
  return {
    externalAdReply: {
      title: getAdsTag(settings), body: text, mediaType: 1, showAdAttribution: true,
      renderLargerThumbnail: false, sourceUrl: config.menu.adsUrl
    }
  };
}
