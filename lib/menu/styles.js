// The eight menu skeletons. Every renderer receives the same model:
//   { brand, scope:{title,icon}, info:[[emoji,label,value]], sections:[{label,icon,items}],
//     prefix, footer, ads }
// and returns WhatsApp-friendly text. Commands are always listed one per line,
// straight down under their category heading.
export const STYLE_COUNT = 8;

export const STYLE_DESCRIPTIONS = {
  1: 'Boxed panels — the default PAXTON MD V2 look',
  2: 'Clean minimal list, no boxes',
  3: 'Numbered commands, compact',
  4: 'Card layout with diamond bullets',
  5: 'Minimal, thin dividers, straight list',
  6: 'Plain bold headings, no border art',
  7: 'Bold-serif header with ❏ boxes',
  8: 'Bulleted boxes ("menu2")'
};

const BOLD = '𝐀𝐁𝐂𝐃𝐄𝐅𝐆𝐇𝐈𝐉𝐊𝐋𝐌𝐍𝐎𝐏𝐐𝐑𝐒𝐓𝐔𝐕𝐖𝐗𝐘𝐙𝐚𝐛𝐜𝐝𝐞𝐟𝐠𝐡𝐢𝐣𝐤𝐥𝐦𝐧𝐨𝐩𝐪𝐫𝐬𝐭𝐮𝐯𝐰𝐱𝐲𝐳𝟎𝟏𝟐𝟑𝟒𝟓𝟔𝟕𝟖𝟗';
const PLAIN = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const boldSerif = (s) => [...String(s)].map((c) => { const i = PLAIN.indexOf(c); return i === -1 ? c : [...BOLD][i]; }).join('');

const tag = (i) => (i.flagged ? '⚠️' : '');

// Kept for other callers: wraps tokens into lines no wider than `width`.
export function wrap(tokens, width = 30, sep = '  ') {
  const lines = []; let line = '';
  for (const t of tokens) {
    if (!line) { line = t; continue; }
    if ([...line].length + sep.length + [...t].length <= width) line += sep + t;
    else { lines.push(line); line = t; }
  }
  if (line) lines.push(line);
  return lines;
}
// One entry per command, so every menu reads as a straight vertical list.
const cmdLines = (items, prefix, numbered = false, start = 1) => items.map((i, n) => `${numbered ? `${start + n}. ` : ''}${prefix}${i.name}${tag(i)}`);
const block = (items, prefix, lead = '', numbered = false, start = 1) => cmdLines(items, prefix, numbered, start).map((l) => `${lead}${l}`).join('\n');
const tail = (m) => `${m.ads ? `\n${m.ads}\n` : ''}\n${m.footer}`;
const infoRows = (m, fmt) => m.info.map(([e, l, v]) => fmt(e, l, v)).join('\n');

const STYLES = {
  1: (m) => {
    let t = `╭━━━〔 🌑 ${m.brand} 〕━━━┈⊷\n┃ ${m.scope.icon} *${m.scope.title}*\n┃\n${infoRows(m, (e, l, v) => `┃ ${e} ${l}: ${v}`)}\n╰━━━━━━━━━━━━━━━┈⊷\n`;
    for (const s of m.sections) t += `\n╭━━〔 ${s.icon} *${s.label}* · ${s.items.length} 〕\n${block(s.items, m.prefix, '┃ ')}\n╰━━━━━━━━━━━━┈⊷\n`;
    return `${t}${tail(m)}`.replace(/\n{3,}/g, '\n\n');
  },
  2: (m) => {
    let t = `*🌑 ${m.brand}* · ${m.scope.title}\n${m.info.filter(([, l]) => ['Mode', 'Prefix', 'Owner', 'Plugins'].includes(l)).map(([, l, v]) => `${l}: ${v}`).join(' · ')}\n${m.info.filter(([, l]) => ['Runtime', 'User', 'Time', 'Date'].includes(l)).map(([, l, v]) => `${l}: ${v}`).join(' · ')}\n`;
    for (const s of m.sections) t += `\n*${s.icon} ${s.label}* (${s.items.length})\n${block(s.items, m.prefix)}\n`;
    return `${t}${tail(m)}`;
  },
  3: (m) => {
    let t = `┌─❖ *${m.brand}* ❖─┐\n│ ${m.scope.icon} ${m.scope.title}\n${infoRows(m, (e, l, v) => `│ ${e} ${l}: ${v}`)}\n└──────────────┘\n`;
    let n = 1;
    for (const s of m.sections) {
      t += `\n▸ *${s.label}*\n${block(s.items, m.prefix, '', true, n)}\n`;
      n += s.items.length;
    }
    return `${t}${tail(m)}`;
  },
  4: (m) => {
    let t = `◈━━━━━━━━━━━━━━━◈\n   ⚡ *${m.brand}* ⚡\n   ${m.scope.icon} ${m.scope.title}\n◈━━━━━━━━━━━━━━━◈\n${infoRows(m, (e, l, v) => `${e} ${l}: ${v}`)}\n`;
    for (const s of m.sections) t += `\n◆ *${s.label}* ${s.icon}\n${block(s.items, m.prefix, '  ⟢ ')}\n`;
    return `${t}${tail(m)}`;
  },
  5: (m) => {
    const pick = (l) => m.info.find(([, x]) => x === l)?.[2];
    let t = `⚡ *${m.brand}* | ${m.scope.title}\n${pick('Mode')} | Prefix: ${pick('Prefix')} | ${pick('Plugins')} cmds | ${pick('Runtime')}\n━━━━━━━━━━━━━━━━━━━━\n`;
    for (const s of m.sections) t += `*${s.label}*\n${block(s.items, m.prefix, '› ')}\n`;
    return `${t}━━━━━━━━━━━━━━━━━━━━${tail(m)}`;
  },
  6: (m) => {
    let t = `*${m.brand}* — ${m.scope.title}\n${m.info.map(([, l, v]) => `${l}: ${v}`).join('\n')}\n`;
    for (const s of m.sections) t += `\n*${s.label.charAt(0)}${s.label.slice(1).toLowerCase()}*\n${block(s.items, m.prefix)}\n`;
    return `${t}${tail(m)}`;
  },
  7: (m) => {
    let t = `╭─❏『 *${boldSerif(m.brand)}* 』\n│ ${m.scope.icon} *${m.scope.title}*\n${infoRows(m, (e, l, v) => `│ *${l}:* ${v}`)}\n╰─❏\n`;
    for (const s of m.sections) t += `\n╭─❏ ◈『 *${boldSerif(s.label)}* 』◈\n${block(s.items, m.prefix, '├❏ ')}\n╰─❏\n`;
    return `${t}${tail(m)}`;
  },
  8: (m) => {
    let t = `╭─⌈ 🤖 *${m.brand}* ⌋\n│ ${m.scope.icon} ${m.scope.title}\n${infoRows(m, (e, l, v) => `│ ${e} ${l}: ${v}`)}\n╰⊷\n`;
    for (const s of m.sections) t += `\n╭─⊷ *${s.label}*\n${block(s.items, m.prefix, '│ • ')}\n╰─⊷\n`;
    return `${t}${tail(m)}`;
  }
};

export function renderMenu(style, model) {
  const fn = STYLES[style] || STYLES[1];
  return fn(model);
}

// Header-only text (used as the image caption when a menu image is enabled).
export function renderHeader(model) {
  return `╭━━━〔 🌑 ${model.brand} 〕━━━┈⊷\n┃ ${model.scope.icon} *${model.scope.title}*\n${model.info.map(([e, l, v]) => `┃ ${e} ${l}: ${v}`).join('\n')}\n╰━━━━━━━━━━━━━━━┈⊷`;
}

// Compact category index: "🛡️ ADMIN · 40  →  .menu admin"
export function renderIndex(model, categoryLines) {
  return `╭━━━〔 🌑 ${model.brand} 〕━━━┈⊷\n┃ ${model.scope.icon} *${model.scope.title}*\n┃ 💬 Prefix: ${model.info.find(([, l]) => l === 'Prefix')?.[2]}\n╰━━━━━━━━━━━━━━━┈⊷\n\n${categoryLines.join('\n')}\n\n➡️ Send *${model.prefix}menu <category>* for details.${tail(model)}`;
}

export function renderCategoryPage({ prefix, section, meta, page, pages, total, scopeTitle }) {
  let t = `╭─〔 ${section.icon} *${section.label}* 〕\n│ _${meta.tagline}_\n│ ${total} command${total === 1 ? '' : 's'} · page ${page}/${pages}\n╰──────────────\n\n`;
  for (const i of section.items) {
    const desc = i.description.split(/\.?\s*Usage:/)[0].split('\n')[0].trim();
    t += `▸ *${prefix}${i.name}*${tag(i)}\n   ${desc.length > 70 ? `${desc.slice(0, 67)}...` : desc || '—'}\n`;
  }
  t += `\n◇ ${prefix}menu · ${prefix}cmdinfo <command>`;
  if (pages > 1) t += `\n◇ Next: ${prefix}menu ${section.key} ${page < pages ? page + 1 : 1}`;
  return t;
}
