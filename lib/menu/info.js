// Bot information block shown at the top of every menu.
import os from 'os';
import { config } from '../../config/index.js';
import { hasKey } from '../../config/keys.js';
import { formatRuntimeHMS } from '../utils/format.js';

export function clock(tz) {
  const zone = tz || 'UTC';
  const make = (opts) => { try { return new Intl.DateTimeFormat('en-GB', { timeZone: zone, ...opts }); } catch { return new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', ...opts }); } };
  const now = new Date();
  return {
    time: make({ hour: '2-digit', minute: '2-digit', hour12: false }).format(now),
    date: make({ day: '2-digit', month: 'short', year: 'numeric' }).format(now)
  };
}

const MODE_LABEL = { public: '🌍 Public', private: '🔒 Private', silent: '🤫 Silent' };

// Returns [emoji, label, value] rows in display order.
export function buildInfo(ctx, { scope, senderJid, groupName, connected = true }) {
  const settings = ctx.getGlobalSettings();
  const { time, date } = clock(settings.timezone);
  const prefix = ctx.isPrefixless ? 'none' : (ctx.getPrefixList?.() || [ctx.getCurrentPrefix?.() || '.']).join(' ');
  const mode = ctx.BOT_MODE || 'public';
  const rows = [
    ['🌍', 'Mode', (MODE_LABEL[mode] || mode).replace(/^\S+\s/, '')],
    ['💬', 'Prefix', prefix],
    ['👑', 'Owner', settings.ownerName || config.bot.ownerName],
    ['📦', 'Plugins', String(ctx.getTotalCommandCount())],
    ['📊', 'Status', connected ? '🟢 ONLINE' : '🔴 OFFLINE'],
    ['⏱️', 'Runtime', formatRuntimeHMS(process.uptime())],
    ['👤', 'User', `@${String(senderJid || '').split('@')[0].split(':')[0]}`],
    ['🕐', 'Time', time],
    ['📅', 'Date', date]
  ];
  if (scope === 'group' || scope === 'admin') if (groupName) rows.splice(2, 0, ['👥', 'Group', groupName]);
  if (scope === 'owner' || scope === 'private') {
    rows.push(['🏷️', 'Version', `v${ctx.VERSION}`]);
    rows.push(['💾', 'RAM', `${Math.round(process.memoryUsage().rss / 1048576)} MB / ${Math.round(os.totalmem() / 1073741824)} GB`]);
    rows.push(['🖥️', 'Host', config.platform]);
    rows.push(['🔑', 'API', hasKey('WOLVAREX_API_KEY') ? 'configured' : 'not set']);
  }
  return rows;
}

export function brandLine(ctx) {
  const name = String(ctx.BOT_NAME || 'Paxton MD').toUpperCase();
  const major = String(ctx.VERSION || '2').split('.')[0];
  return /\bV\d+$/.test(name) ? name : `${name} V${major}`;
}
