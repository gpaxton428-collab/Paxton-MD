import { getGlobalSettings, getGroupSettings } from '../settingsStore.js';
import { CATEGORY_META, resolveCategory } from './categories.js';
import { SCOPES, SCOPE_NAMES, autoScope, resolveScope } from './scopes.js';
import { collectSections } from './visibility.js';
import { brandLine, buildInfo } from './info.js';
import { getAds } from './ads.js';
import { renderMenu, renderHeader, renderIndex, renderCategoryPage, STYLE_COUNT } from './styles.js';

const PAGE_SIZE = 10;

export function resolveStyle(scope, groupJid) {
  const s = getGlobalSettings();
  const groupStyle = groupJid ? getGroupSettings(groupJid)?.menuStyle : null;
  const scoped = s.menuStyles?.[scope];
  const n = Number(groupStyle ?? scoped ?? s.menuStyle) || 1;
  return n >= 1 && n <= STYLE_COUNT ? n : 1;
}

function makeModel(ctx, scope, opts) {
  const s = getGlobalSettings();
  return {
    brand: brandLine(ctx),
    scope: SCOPES[scope],
    info: buildInfo(ctx, { scope, senderJid: opts.senderJid, groupName: opts.groupName, connected: ctx.isWhatsAppConnected?.() ?? true }),
    prefix: ctx.isPrefixless ? '' : ctx.getCurrentPrefix?.() || '.',
    footer: `> ${s.menuFooter || 'ᴘᴏᴡᴇʀᴇᴅ ʙʏ Paxton-Tech'}`,
    ads: getAds(s)
  };
}

// Works out what the person may see and which view to show.
export function planMenu(ctx, { requested, isOwner, isAdmin, inGroup }) {
  const entitled = autoScope({ isOwner, isAdmin, inGroup });
  const scope = resolveScope(requested, entitled);
  return { scope, entitled };
}

export function buildMainMenu(ctx, { scope, senderJid, groupName, groupJid, isOwner }) {
  const model = makeModel(ctx, scope, { senderJid, groupName });
  model.sections = collectSections(ctx, scope, { isOwner });
  const style = resolveStyle(scope, groupJid);
  return { text: renderMenu(style, model), header: renderHeader(model), style };
}

export function buildIndex(ctx, { scope, senderJid, isOwner }) {
  const model = makeModel(ctx, scope, { senderJid });
  const sections = collectSections(ctx, scope, { isOwner });
  const lines = sections.map((s) => `${s.icon} *${s.label}* · ${s.items.length}  →  ${model.prefix}menu ${s.key === 'bot-settings' ? 'settings' : s.key}`);
  return renderIndex(model, lines);
}

// Drill-down for one category (also used by the *menu shortcut commands).
export function buildCategory(ctx, { category, page = 1, scope, isOwner }) {
  const sections = collectSections(ctx, scope, { isOwner });
  const section = sections.find((s) => s.key === category);
  if (!section) return null;
  const pages = Math.max(1, Math.ceil(section.items.length / PAGE_SIZE));
  const p = Math.min(Math.max(1, Number(page) || 1), pages);
  const slice = { ...section, items: section.items.slice((p - 1) * PAGE_SIZE, p * PAGE_SIZE) };
  return renderCategoryPage({
    prefix: ctx.isPrefixless ? '' : ctx.getCurrentPrefix?.() || '.',
    section: slice, meta: CATEGORY_META[category] || { tagline: '' }, page: p, pages, total: section.items.length
  });
}

export { resolveCategory, SCOPE_NAMES, STYLE_COUNT };
