// Optional, clearly-labelled advertisement block. Configurable through
// settings (.setmenuads) with environment defaults; never styled to look
// like a WhatsApp/system message.
import { config } from '../../config/index.js';

export function getAds(settings) {
  const enabled = settings.menuAdsEnabled ?? config.menu.adsEnabled;
  if (!enabled) return null;
  const text = String(settings.menuAdsText || config.menu.adsText || '').replace(/\s+/g, ' ').trim().slice(0, 160);
  if (!text) return null;
  return `📢 ADVERTISEMENT\n${text}`;
}
