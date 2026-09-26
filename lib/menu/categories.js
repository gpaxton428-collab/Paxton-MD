// Display metadata for every command category, plus which "tools" commands
// are really general-purpose utilities (so the menu can show a UTILITY
// section without moving 50 files around).
export const CATEGORY_META = {
  admin:         { label: 'ADMIN',        icon: '🛡️', tagline: 'moderation and enforcement' },
  ai:            { label: 'AI',           icon: '🤖', tagline: 'the bot with a mind of its own' },
  automation:    { label: 'AUTOMATION',   icon: '⚙️', tagline: 'set it once, let it run' },
  'bot-settings':{ label: 'BOT SETTINGS', icon: '🔧', tagline: 'tune it until it feels like yours' },
  converter:     { label: 'CONVERTER',    icon: '🔄', tagline: 'one format into another' },
  dev:           { label: 'DEV',          icon: '🧑‍💻', tagline: 'under the hood, for those who built it' },
  fun:           { label: 'FUN',          icon: '🎲', tagline: 'beyond the ordinary, purely for laughs' },
  group:         { label: 'GROUP',        icon: '👥', tagline: 'moderation, roles, and the room itself' },
  media:         { label: 'MEDIA',        icon: '🖼️', tagline: 'stickers and image tools' },
  owner:         { label: 'OWNER',        icon: '👑', tagline: 'the keys to the whole thing' },
  sudo:          { label: 'SUDO',         icon: '🔑', tagline: 'trust, extended' },
  tools:         { label: 'TOOLS',        icon: '🧰', tagline: 'small things, done reliably' },
  user:          { label: 'USER',         icon: '👤', tagline: 'everyday commands for everyone' },
  download:      { label: 'DOWNLOAD',     icon: '⬇️', tagline: 'music and social media downloads' },
  search:        { label: 'SEARCH',       icon: '🔎', tagline: 'find songs and videos' },
  utility:       { label: 'UTILITY',      icon: '🧮', tagline: 'text, numbers and quick helpers' },
  menustyle:     { label: 'MENU STYLE',   icon: '🎨', tagline: 'the same bot, a different face' }
};

export const CATEGORY_ORDER = ['admin', 'ai', 'automation', 'bot-settings', 'converter', 'dev', 'fun', 'group', 'media', 'owner', 'sudo', 'tools', 'user', 'download', 'search', 'utility', 'menustyle'];

// Words people type for `.menu <word>`
export const CATEGORY_ALIASES = {
  settings: 'bot-settings', botsettings: 'bot-settings', 'bot-settings': 'bot-settings', bot: 'bot-settings',
  downloads: 'download', dl: 'download', utilities: 'utility', utils: 'utility', style: 'menustyle', styles: 'menustyle',
  users: 'user', games: 'fun'
};

export function resolveCategory(word) {
  const w = String(word || '').toLowerCase().trim();
  if (CATEGORY_META[w]) return w;
  return CATEGORY_ALIASES[w] || null;
}

// Text/number helpers that live in commands/tools but belong under UTILITY.
export const UTILITY_COMMANDS = new Set([
  'acronym', 'age', 'ageguess', 'base64', 'binary', 'bmi', 'bmiadvice', 'calc', 'capitalize', 'charcount', 'colorconvert',
  'countdown', 'countword', 'currency', 'debinary', 'demorse', 'deroman', 'duration', 'factorial', 'gcd', 'hash', 'isprime',
  'jsonformat', 'leet', 'lorem', 'morse', 'nowtimestamp', 'numbertowords', 'palindrome', 'password', 'percentage', 'randomchoice',
  'randomcolor', 'randomdate', 'randomemoji', 'randomnumber', 'reverse', 'roman', 'rot13', 'slug', 'stringlength', 'textcase',
  'textreverse2', 'textstats', 'timestamp', 'tip', 'unitconvert', 'uuid', 'vowelcount', 'wordcase', 'wordfrequency'
]);

export function categoryOverride(command, folderCategory) {
  if (folderCategory === 'tools' && UTILITY_COMMANDS.has(String(command.name).toLowerCase())) return 'utility';
  return command.menuCategory || folderCategory;
}
