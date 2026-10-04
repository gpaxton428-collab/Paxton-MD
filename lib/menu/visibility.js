// Decides which commands a menu shows. Only commands that can actually
// work are listed: hidden ones are skipped, and commands whose required
// API keys are missing are hidden (owners see them flagged with ⚠️).
import { hasKey } from '../../config/keys.js';
import { CATEGORY_ORDER, CATEGORY_META } from './categories.js';
import { SCOPES, scopeSeesPrivileged } from './scopes.js';

export function missingRequirements(cmd) {
  return (cmd.requires || []).filter((k) => !hasKey(k));
}

export function collectSections(ctx, scope, { isOwner = false } = {}) {
  const { commands, commandCategories } = ctx;
  const def = SCOPES[scope];
  const privileged = scopeSeesPrivileged(scope);
  const wanted = def.categories;
  const cats = [...commandCategories.keys()].sort((a, b) => {
    const ia = CATEGORY_ORDER.indexOf(a), ib = CATEGORY_ORDER.indexOf(b);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib) || a.localeCompare(b);
  });
  const sections = [];
  for (const cat of cats) {
    if (wanted && !wanted.includes(cat)) continue;
    const items = [];
    for (const name of commandCategories.get(cat) || []) {
      const cmd = commands.get(name.toLowerCase());
      if (!cmd || cmd.hidden) continue;
      if (cmd.strictOwner && !isOwner) continue;
      if (cmd.ownerOnly && !privileged) continue;
      const missing = missingRequirements(cmd);
      if (missing.length && !privileged) continue;
      items.push({ name: cmd.name, description: cmd.description || '', flagged: missing.length > 0 });
    }
    if (items.length) sections.push({ key: cat, label: CATEGORY_META[cat]?.label || cat.toUpperCase(), icon: CATEGORY_META[cat]?.icon || '•', items });
  }
  return sections;
}
